"""
Visonix AI Service
-------------------
FastAPI wrapper around the CSRNet crowd-density model.

Endpoints:
  GET  /                -> health check
  POST /predict          -> single image, returns count + status
  POST /predict-frames   -> multiple images (e.g. extracted video frames)
                            in one call, returns per-frame + summary

Run locally:
  uvicorn main:app --reload --port 8000

Then open http://localhost:8000/docs for the interactive test UI.
"""

import io
import os
import cv2
import tempfile
import shutil
import torch
import torchvision.transforms.functional as F
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image

from model import CSRNet

# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------

app = FastAPI(title="Visonix AI Service", version="1.0.0")

# Allow the Node.js backend (and browser during local testing) to call this
# service. Tighten allow_origins to your real backend URL before deploying.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Config — thresholds tuned during Colab testing
# ---------------------------------------------------------------------------

WEIGHTS_PATH = os.path.join(os.path.dirname(__file__), "weights", "PartAmodel_best.pth.tar")
MAX_DIMENSION = 1024          # resize cap that fixed the high-resolution overestimate bug
SAFE_THRESHOLD = 50            # count < this  -> Safe
CROWDED_THRESHOLD = 150        # count < this  -> Crowded, else Dangerous

# ---------------------------------------------------------------------------
# Load model once at startup (not per-request — that would be very slow)
# ---------------------------------------------------------------------------

model = CSRNet()
checkpoint = torch.load(WEIGHTS_PATH, map_location="cpu", weights_only=False)
model.load_state_dict(checkpoint["state_dict"])
model.eval()
print(f"[Visonix AI] Model loaded from {WEIGHTS_PATH}")


# ---------------------------------------------------------------------------
# Helpers (same logic validated in Colab)
# ---------------------------------------------------------------------------

def resize_for_csrnet(img: Image.Image, max_dimension: int = MAX_DIMENSION) -> Image.Image:
    """Cap the longest side to max_dimension (keeps aspect ratio), then round
    both dimensions down to a multiple of 8, as CSRNet's pooling layers
    require. Prevents the high-resolution noise-amplification issue found
    during testing (4K frames were producing inflated counts)."""
    w, h = img.size
    if max(w, h) > max_dimension:
        scale = max_dimension / max(w, h)
        w, h = int(w * scale), int(h * scale)
    new_w, new_h = (w // 8) * 8, (h // 8) * 8
    return img.resize((new_w, new_h))


def classify(count: int) -> str:
    if count < SAFE_THRESHOLD:
        return "Safe"
    elif count < CROWDED_THRESHOLD:
        return "Crowded"
    return "Dangerous"


def predict_from_pil(img: Image.Image) -> dict:
    img_resized = resize_for_csrnet(img.convert("RGB"))
    img_tensor = F.to_tensor(img_resized).unsqueeze(0)   # normalization hataya - Colab jaisa exact match

    with torch.no_grad():
        output = model(img_tensor)

    count = int(output.detach().cpu().sum().numpy())
    return {"count": count, "status": classify(count)}


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/")
def health_check():
    return {"status": "ok", "service": "Visonix AI Service"}


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    """Single image -> count + status."""
    image_bytes = await file.read()
    img = Image.open(io.BytesIO(image_bytes))
    result = predict_from_pil(img)
    return result


@app.post("/predict-frames")
async def predict_frames(files: list[UploadFile] = File(...)):
    """
    Multiple images in one call (e.g. frames extracted from one video, or
    the latest frame from several zones/cameras). Returns a per-image result
    plus a simple overall summary.

    This mirrors the multi-zone test done in Colab: each image/frame is
    processed independently, then compared.
    """
    results = []
    for f in files:
        image_bytes = await f.read()
        img = Image.open(io.BytesIO(image_bytes))
        result = predict_from_pil(img)
        result["filename"] = f.filename
        results.append(result)

    dangerous = [r for r in results if r["status"] == "Dangerous"]
    crowded = [r for r in results if r["status"] == "Crowded"]

    summary = {
        "total_processed": len(results),
        "dangerous_count": len(dangerous),
        "crowded_count": len(crowded),
        "safe_count": len(results) - len(dangerous) - len(crowded),
    }

    return {"results": results, "summary": summary}

@app.post("/predict-video")
async def predict_video(file: UploadFile = File(...)):
    """
    Accepts a full video file, extracts frames at a fixed interval
    (same logic validated in Colab), runs prediction on each frame,
    and returns per-frame results + an overall summary.
    """
    # Save the uploaded video to a temporary file (cv2 needs a file path, not raw bytes)
    temp_dir = tempfile.mkdtemp()
    video_path = os.path.join(temp_dir, file.filename)

    with open(video_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        cap = cv2.VideoCapture(video_path)
        fps = cap.get(cv2.CAP_PROP_FPS) or 25  # fallback if fps read fails
        total_raw_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        duration = total_raw_frames / fps if fps else 0

        # Same adaptive sampling logic validated in Colab:
        # short clips get sampled more frequently so we still get enough frames
        if duration < 10:
            frame_interval = max(1, int(fps * 0.5))
        else:
            frame_interval = int(fps * 2)

        frame_count = 0
        results = []

        while True:
            ret, frame = cap.read()
            if not ret:
                break

            if frame_count % frame_interval == 0:
                # cv2 gives BGR numpy arrays; convert to a PIL RGB image
                frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                img = Image.fromarray(frame_rgb)
                result = predict_from_pil(img)
                result["frame_index"] = frame_count
                result["timestamp_seconds"] = round(frame_count / fps, 2)
                results.append(result)

            frame_count += 1

        cap.release()

    finally:
        # Always clean up the temp video file, even if something failed above
        shutil.rmtree(temp_dir, ignore_errors=True)

    dangerous = [r for r in results if r["status"] == "Dangerous"]
    crowded = [r for r in results if r["status"] == "Crowded"]

    summary = {
        "video_duration_seconds": round(duration, 2),
        "frames_analyzed": len(results),
        "peak_count": max((r["count"] for r in results), default=0),
        "dangerous_frames": len(dangerous),
        "crowded_frames": len(crowded),
        "safe_frames": len(results) - len(dangerous) - len(crowded),
        "overall_status": "Dangerous" if dangerous else ("Crowded" if crowded else "Safe"),
    }

    return {"frames": results, "summary": summary}