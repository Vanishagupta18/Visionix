r"""
Visionix - Single-camera live AI service.

ONE IP Webcam (or laptop webcam) -> YOLO (Tier 1, always) -> CSRNet (Tier 2,
via the existing TierSwitcher, only when triggered) -> risk_engine -> pushed
to the Node.js backend -> streamed to the browser as MJPEG + JSON websocket.

Run from the ai-service folder:
    uvicorn live_service:app --reload --port 8000

Endpoints:
    GET  /health, /status
    POST /monitoring/start, /monitoring/stop
    GET  /stream/live        (MJPEG, for an <img> tag)
    WS   /ws/live            (JSON result per processed frame)

Latest-frame-only design: a capture thread overwrites one shared frame;
the inference loop always reads whatever is newest, so stale frames are
dropped instead of queued (this is what removes the lag).
"""

import asyncio
import os
import sys
import threading
import time
from datetime import datetime, timezone

import cv2
import httpx
import torch
import torchvision.transforms.functional as tvF
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from PIL import Image
from ultralytics import YOLO

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(SCRIPT_DIR)

# Optional: if python-dotenv is installed, ai-service/.env is loaded
# automatically (pip install python-dotenv). Not required.
try:
    from dotenv import load_dotenv
    load_dotenv(os.path.join(SCRIPT_DIR, ".env"))
except ImportError:
    pass

from model import CSRNet  # noqa: E402
from risk.tier_switcher import TierSwitcher  # noqa: E402
from risk.risk_engine import compute_risk  # noqa: E402
import weapon_detector  # noqa: E402

# ---------------------------------------------------------------------------
# CONFIG (environment variables, safe local defaults)
# ---------------------------------------------------------------------------
CAMERA_SOURCE = os.environ.get("CAMERA_URL", "0")   # IP Webcam URL, or "0" for laptop webcam
ZONE_NAME = os.environ.get("ZONE_NAME", "Default Zone")
ZONE_AREA_SQM = float(os.environ.get("ZONE_AREA_SQM", "60.0"))

NODE_BACKEND_URL = os.environ.get("NODE_BACKEND_URL", "http://localhost:5000/api/ingest/reading")
INGEST_API_KEY = os.environ.get("INGEST_API_KEY", "")
PUSH_INTERVAL_SEC = float(os.environ.get("PUSH_INTERVAL_SEC", "3"))

YOLO_WEIGHTS = os.environ.get("YOLO_WEIGHTS", os.path.join(SCRIPT_DIR, "yolov8n.pt"))
YOLO_CONF = float(os.environ.get("YOLO_CONF", "0.4"))
CSRNET_WEIGHTS = os.environ.get(
    "CSRNET_WEIGHTS", os.path.join(SCRIPT_DIR, "weights", "PartAmodel_best.pth.tar")
)
WEAPON_WEIGHTS = os.environ.get(
    "WEAPON_WEIGHTS", os.path.join(SCRIPT_DIR, "weapon-detection", "weights", "best.pt")
)

PROCESS_EVERY_N_SEC = float(os.environ.get("PROCESS_EVERY_N_SEC", "0.3"))
JPEG_QUALITY = int(os.environ.get("JPEG_QUALITY", "70"))
RECONNECT_DELAY_SEC = 2.0

# Backend Reading/Zone schemas only accept these three status values, so the
# risk label (4 levels) is mapped down to them for the pushed `status` field.
# The full riskLabel is still sent separately.
RISK_TO_STATUS = {"Safe": "Safe", "Warning": "Crowded", "High Risk": "Dangerous", "Critical": "Dangerous"}

# ---------------------------------------------------------------------------
# Model loading (once, at startup)
# ---------------------------------------------------------------------------
print("[Visionix AI] Loading YOLO...")
yolo_model = YOLO(YOLO_WEIGHTS)
PERSON_CLASS_ID = [k for k, v in yolo_model.names.items() if v == "person"][0]

csrnet_model = None
CSRNET_AVAILABLE = False
csrnet_lock = threading.Lock()
try:
    if os.path.exists(CSRNET_WEIGHTS):
        csrnet_model = CSRNet(load_weights=True)  # True = skip the VGG16 download; we load our own checkpoint
        checkpoint = torch.load(CSRNET_WEIGHTS, map_location="cpu", weights_only=False)
        csrnet_model.load_state_dict(checkpoint["state_dict"])
        csrnet_model.eval()
        CSRNET_AVAILABLE = True
        print(f"[Visionix AI] CSRNet loaded from {CSRNET_WEIGHTS}")
    else:
        print(f"[Visionix AI] WARNING: CSRNet checkpoint not found at {CSRNET_WEIGHTS}")
        print("[Visionix AI] Tier 2 disabled - running YOLO-only.")
except Exception as e:
    print(f"[Visionix AI] ERROR loading CSRNet, Tier 2 disabled: {e}")
    CSRNET_AVAILABLE = False

weapon_detector.try_load(WEAPON_WEIGHTS)  # stays disabled if the file isn't there

# ---------------------------------------------------------------------------
# App + shared state
# ---------------------------------------------------------------------------
app = FastAPI(title="Visionix Live AI Service")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten before deploying
    allow_methods=["*"],
    allow_headers=["*"],
)

state_lock = threading.Lock()
_latest_frame = None
_latest_annotated_jpeg = None
_latest_raw_jpeg = None
_camera_connected = False
_monitoring_active = False
_main_loop = None  # the server's asyncio loop, set on startup (used to broadcast from threads)

_latest_result = {
    "cameraId": ZONE_NAME,
    "timestamp": None,
    "cameraStatus": "stopped",
    "personCount": 0,
    "countSource": "YOLO",
    "crowdMode": "YOLO",
    "detections": [],
    "objectDetections": [],
    "density": {"peoplePerSquareMeter": 0.0, "zoneAreaSqm": ZONE_AREA_SQM},
    "risk": {"score": 0.0, "label": "Safe", "breakdown": {}},
    "inference": {"yoloMs": None, "csrnetMs": None, "objectDetectionMs": None, "totalInferenceMs": None},
}

_ws_clients: set = set()
_stop_event = threading.Event()
_capture_thread = None
_inference_thread = None
_switcher = TierSwitcher()


def _open_capture(source):
    cap = cv2.VideoCapture(int(source) if str(source).isdigit() else source)
    cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
    return cap


# ---------------------------------------------------------------------------
# Capture thread: only keeps _latest_frame fresh. Never queues, never infers.
# ---------------------------------------------------------------------------
def _capture_loop(source):
    global _latest_frame, _camera_connected

    cap = _open_capture(source)
    while not _stop_event.is_set():
        if not cap.isOpened():
            with state_lock:
                _camera_connected = False
            time.sleep(RECONNECT_DELAY_SEC)
            cap = _open_capture(source)
            continue

        ret, frame = cap.read()
        if not ret:
            with state_lock:
                _camera_connected = False
            cap.release()
            time.sleep(RECONNECT_DELAY_SEC)
            cap = _open_capture(source)
            continue

        with state_lock:
            _latest_frame = frame
            _camera_connected = True

    cap.release()
    with state_lock:
        _camera_connected = False


# ---------------------------------------------------------------------------
# Inference loop
# ---------------------------------------------------------------------------
def _run_csrnet(frame_bgr):
    pil_img = Image.fromarray(cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB))
    w, h = pil_img.size
    max_dim = 1024
    if max(w, h) > max_dim:
        scale = max_dim / max(w, h)
        w, h = int(w * scale), int(h * scale)
    pil_img = pil_img.resize(((w // 8) * 8, (h // 8) * 8))

    tensor = tvF.to_tensor(pil_img).unsqueeze(0)  # same preprocessing as main.py (no normalisation)
    with torch.no_grad():
        output = csrnet_model(tensor)
    return int(output.detach().cpu().sum().numpy())


def _inference_loop():
    global _latest_annotated_jpeg, _latest_raw_jpeg, _latest_result

    while not _stop_event.is_set():
        loop_start = time.time()

        with state_lock:
            frame = None if _latest_frame is None else _latest_frame.copy()
            connected = _camera_connected

        if frame is None or not connected:
            _switcher.__init__()   # mode wapas YOLO, counters zero
            with state_lock:
                _latest_annotated_jpeg = None   # purana frame hatao
                _latest_result = {
                    **_latest_result,
                    "cameraStatus": "disconnected",
                    "personCount": 0,
                    "countSource": "-",
                    "crowdMode": "YOLO",
                    "detections": [],
                    "objectDetections": [],
                    "density": {"peoplePerSquareMeter": 0.0, "zoneAreaSqm": ZONE_AREA_SQM},
                    "risk": {"score": 0.0, "label": "Safe", "breakdown": {}},
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                }
            time.sleep(PROCESS_EVERY_N_SEC)
            continue

        t0 = time.time()
        results = yolo_model(frame, conf=YOLO_CONF, classes=[0], verbose=False)
        yolo_ms = (time.time() - t0) * 1000
        r = results[0]

        detections = []
        for box in r.boxes:
            if int(box.cls[0]) != PERSON_CLASS_ID:
                continue
            x1, y1, x2, y2 = [float(v) for v in box.xyxy[0]]
            detections.append({
                "className": "person",
                "confidence": round(float(box.conf[0]), 3),
                "bbox": {"x1": round(x1, 1), "y1": round(y1, 1), "x2": round(x2, 1), "y2": round(y2, 1)},
            })
        yolo_count = len(detections)

        run_csrnet, _reason = _switcher.decide(yolo_count, current_time=time.time())
        run_csrnet = run_csrnet and CSRNET_AVAILABLE

        csrnet_ms = None
        final_count, count_source = yolo_count, "YOLO"
        if run_csrnet:
            t1 = time.time()
            with csrnet_lock:
                csrnet_count = _run_csrnet(frame)
            csrnet_ms = (time.time() - t1) * 1000
            _switcher.report_csrnet_result(csrnet_count)
            if _switcher.mode == "CSRNET":
                final_count, count_source = max(csrnet_count, yolo_count), "CSRNet"

        crowd_mode = _switcher.mode if CSRNET_AVAILABLE else "YOLO"

        t2 = time.time()
        object_detections = weapon_detector.detect_objects(frame)
        obj_ms = (time.time() - t2) * 1000 if weapon_detector.is_available() else None

        risk_score, risk_label, breakdown = compute_risk(final_count, zone_area_sqm=ZONE_AREA_SQM)

        annotated = r.plot()
        colors = {"Safe": (0, 255, 0), "Warning": (0, 200, 255),
                  "High Risk": (0, 140, 255), "Critical": (0, 0, 255)}
        cv2.putText(annotated, f"Count: {final_count} ({count_source})", (16, 34),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)
        cv2.putText(annotated, f"Risk: {risk_score:.0f}% ({risk_label})", (16, 66),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, colors.get(risk_label, (255, 255, 255)), 2)
        if not CSRNET_AVAILABLE:
            cv2.putText(annotated, "CSRNet: unavailable", (16, 98),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.55, (0, 165, 255), 1)
        ok, jpeg = cv2.imencode(".jpg", annotated, [cv2.IMWRITE_JPEG_QUALITY, JPEG_QUALITY])
        ok_raw, raw_jpeg = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, JPEG_QUALITY])

        result = {
            "cameraId": ZONE_NAME,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "cameraStatus": "connected",
            "personCount": final_count,
            "countSource": count_source,
            "crowdMode": crowd_mode,
            "detections": detections,
            "objectDetections": object_detections,
            "density": {"peoplePerSquareMeter": round(final_count / ZONE_AREA_SQM, 3),
                        "zoneAreaSqm": ZONE_AREA_SQM},
            "risk": {"score": risk_score, "label": risk_label, "breakdown": breakdown},
            "inference": {
                "yoloMs": round(yolo_ms, 1),
                "csrnetMs": round(csrnet_ms, 1) if csrnet_ms is not None else None,
                "objectDetectionMs": round(obj_ms, 1) if obj_ms is not None else None,
                "totalInferenceMs": round((time.time() - t0) * 1000, 1),
            },
            "csrnetAvailable": CSRNET_AVAILABLE,
            "objectDetectionAvailable": weapon_detector.is_available(),
        }

        with state_lock:
            _latest_result = result
            if ok:
                _latest_annotated_jpeg = jpeg.tobytes()
            if ok_raw:
                _latest_raw_jpeg = raw_jpeg.tobytes()

        if _main_loop is not None and _ws_clients:
            asyncio.run_coroutine_threadsafe(_broadcast_ws(result), _main_loop)

        time.sleep(max(0.0, PROCESS_EVERY_N_SEC - (time.time() - loop_start)))


async def _broadcast_ws(payload: dict):
    dead = []
    for ws in list(_ws_clients):
        try:
            await ws.send_json(payload)
        except Exception:
            dead.append(ws)
    for ws in dead:
        _ws_clients.discard(ws)


# ---------------------------------------------------------------------------
# Push readings to Node on a fixed interval, decoupled from inference so a
# slow or offline backend never affects the camera pipeline.
# ---------------------------------------------------------------------------
async def _push_to_backend_loop():
    while True:
        await asyncio.sleep(PUSH_INTERVAL_SEC)
        with state_lock:
            result = dict(_latest_result)
        if result.get("cameraStatus") != "connected":
            continue

        risk_label = result["risk"]["label"]
        payload = {
            "zoneName": result["cameraId"],
            "count": result["personCount"],
            "status": RISK_TO_STATUS.get(risk_label, "Safe"),
            "countSource": result["countSource"],
            "crowdMode": result["crowdMode"],
            "density": result["density"]["peoplePerSquareMeter"],
            "riskScore": result["risk"]["score"],
            "riskLabel": risk_label,
            "cameraStatus": result["cameraStatus"],
            "inferenceMs": result["inference"]["totalInferenceMs"],
            "timestamp": result["timestamp"],
        }
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.post(NODE_BACKEND_URL, json=payload,
                                         headers={"x-ingest-key": INGEST_API_KEY})
                if resp.status_code >= 400:
                    print(f"[Visionix AI] Backend rejected reading: {resp.status_code} {resp.text[:200]}")
        except Exception as e:
            print(f"[Visionix AI] Failed to push reading to backend: {e}")


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.get("/")
@app.get("/health")
def health():
    return {"status": "ok", "service": "Visionix Live AI Service"}


@app.get("/status")
def status():
    with state_lock:
        return {
            "monitoringActive": _monitoring_active,
            "cameraConnected": _camera_connected,
            "csrnetAvailable": CSRNET_AVAILABLE,
            "objectDetectionAvailable": weapon_detector.is_available(),
            "latestResult": _latest_result,
        }


@app.post("/monitoring/start")
def start_monitoring():
    global _capture_thread, _inference_thread, _monitoring_active
    if _monitoring_active:
        return {"status": "already_running"}

    # Make sure threads from a previous run have fully exited before restarting.
    for t in (_capture_thread, _inference_thread):
        if t is not None and t.is_alive():
            t.join(timeout=3)

    _stop_event.clear()
    _capture_thread = threading.Thread(target=_capture_loop, args=(CAMERA_SOURCE,), daemon=True)
    _inference_thread = threading.Thread(target=_inference_loop, daemon=True)
    _capture_thread.start()
    _inference_thread.start()
    _monitoring_active = True
    return {"status": "started"}


@app.post("/monitoring/stop")
def stop_monitoring():
    global _monitoring_active, _latest_frame, _camera_connected, _latest_result
    _stop_event.set()
    _monitoring_active = False
    with state_lock:
        _latest_frame = None
        _camera_connected = False
        _latest_result = {**_latest_result, "cameraStatus": "stopped"}
    return {"status": "stopped"}


@app.get("/stream/live")
def stream_live():
    """MJPEG stream - use as <img src="http://localhost:8000/stream/live">."""
    def gen():
        while True:
            with state_lock:
                frame = _latest_annotated_jpeg
            if frame is not None:
                yield b"--frame\r\nContent-Type: image/jpeg\r\n\r\n" + frame + b"\r\n"
            time.sleep(PROCESS_EVERY_N_SEC)

    return StreamingResponse(gen(), media_type="multipart/x-mixed-replace; boundary=frame")

@app.get("/stream/raw")
def stream_raw():
    """Saaf camera feed: koi box, count ya risk text nahi (Alerts page ke liye)."""
    def gen():
        while True:
            with state_lock:
                frame = _latest_raw_jpeg
            if frame is not None:
                yield b"--frame\r\nContent-Type: image/jpeg\r\n\r\n" + frame + b"\r\n"
            time.sleep(PROCESS_EVERY_N_SEC)

    return StreamingResponse(gen(), media_type="multipart/x-mixed-replace; boundary=frame")



@app.websocket("/ws/live")
async def ws_live(websocket: WebSocket):
    await websocket.accept()
    _ws_clients.add(websocket)
    try:
        with state_lock:
            snapshot = dict(_latest_result)
        await websocket.send_json(snapshot)
        while True:
            await websocket.receive_text()  # keep-alive
    except WebSocketDisconnect:
        _ws_clients.discard(websocket)


@app.on_event("startup")
async def on_startup():
    global _main_loop
    _main_loop = asyncio.get_running_loop()
    asyncio.create_task(_push_to_backend_loop())
    start_monitoring()  # auto-start so the dashboard shows data without pressing Start


@app.on_event("shutdown")
def on_shutdown():
    _stop_event.set()