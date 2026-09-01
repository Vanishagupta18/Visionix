# Visonix AI Service

FastAPI service wrapping the CSRNet crowd-density model. This is the exact
logic that was tested and validated in Google Colab, packaged as a
standalone, always-running service.

## 1. Add the model weights

Download `PartAmodel_best.pth.tar` (same file used in Colab) and place it
here:

```
ai-service/weights/PartAmodel_best.pth.tar
```

The file is intentionally **not** committed to git (too large). Each
teammate / deployment target needs their own copy in this folder.

## 2. Install dependencies

```bash
cd ai-service
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

> No GPU on your laptop? That's fine — this will run on CPU. It will be
> slower than Colab's free GPU, but functionally identical.

## 3. Run it

```bash
uvicorn main:app --reload --port 8000
```

Open **http://localhost:8000/docs** — FastAPI's interactive Swagger UI lets
you upload a test image and see the JSON response directly in the browser,
no Postman needed.

## Endpoints

| Method | Path              | Purpose                                              |
|--------|-------------------|-------------------------------------------------------|
| GET    | `/`               | Health check                                          |
| POST   | `/predict`        | One image → `{count, status}`                         |
| POST   | `/predict-frames` | Multiple images in one call → per-image + summary     |

## Notes carried over from Colab testing

- Images are always resized so the longest side is capped at 1024px before
  being resized to a multiple of 8. Skipping this caused a high-resolution
  4K test video to wildly overestimate (100+ for a 2-person clip) — this is
  the fix.
- Only Part A weights are used. Part B was tested as a "sparse-scene"
  fallback but consistently underperformed Part A across every tested
  scenario (dense, sparse, and near-empty), so the dual-model logic was
  removed in favour of this simpler, faster single-model setup.
- Classification thresholds (`SAFE_THRESHOLD`, `CROWDED_THRESHOLD` in
  `main.py`) are relative/tunable — adjust per zone if needed once real
  test footage for a specific location is available.
