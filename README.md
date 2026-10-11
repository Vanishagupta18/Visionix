# Visionix — AI Crowd & Weapon Monitoring System

AI-powered monitoring system that estimates crowd density from video/CCTV
footage in real time, detects weapons (gun, knife, hazardous objects) from a
live camera feed, and raises alerts before dangerous situations escalate.

This repository is split into three services:

```
visionix/
├── ai-service/          → Python AI code
│   ├── main.py, model.py, utils.py   → FastAPI + CSRNet (crowd density)
│   ├── risk/                         → crowd risk monitoring & tier switching
│   ├── yolo/                         → YOLO person detector
│   ├── weapon_detector.py            → weapon detection hook for the service
│   └── weapon-detection/             → YOLOv8 weapon detection module (see below)
├── backend/             → Node.js + Express + MongoDB (main API, alerts, storage)
├── frontend/            → React (dashboard UI)
└── README.md
```

## How the pieces connect

```
Video/Frame → ai-service (FastAPI, CSRNet + YOLO) → count + status / weapon alerts
                        │
                        ▼
                 backend (Node/Express)
                 - saves readings and detections to MongoDB
                 - checks alert rules
                 - pushes updates via Socket.io
                        │
                        ▼
                 frontend (React dashboard)
                 - live zone status
                 - trend graphs
                 - alerts panel
```

## Getting Started (Order Matters)

1. **AI Service first** — see `ai-service/README.md`.
2. **Backend second** — see `backend/README.md`.
3. **Frontend last** — see `frontend/README.md`.

## Weapon Detection Module

Location: `ai-service/weapon-detection/` (this is the only weapon-detection
folder in the repo).

A YOLOv8 model trained on a Roboflow dataset. It detects 3 classes:

| ID | Class           |
|----|-----------------|
| 0  | `gun`           |
| 1  | `hazard_object` |
| 2  | `knife`         |

### What's inside

| File | Purpose |
|------|---------|
| `live_test.py` | Live detection from a phone camera (IP Webcam) with auto-reconnect; saves detections to MongoDB |
| `live_wweapon_detection.py` | Live detection script using the Roboflow dataset and trained model |
| `weapon_detect_video.py` | Run detection on a video file |
| `weapon_detect_youtube.py` | Run detection on a YouTube video |
| `retrain_weapon_detection.py` | Download a Roboflow dataset version and retrain from pretrained `yolov8n.pt` |
| `retrain_model_v2.py`, `retrain_model_run4.py`, `resume_training.py` | Earlier retraining / resume scripts |
| `view_boxes.py` | Visualise labelled boxes from the dataset |
| `view_mongo_images.py` | View detection images saved in MongoDB |
| `data.yaml` | Dataset config |
| `models/best.pt` | Trained weights (about 6 MB, included in the repo) |
| `.env.example` | Template for required environment variables |

### Setup

1. Install dependencies:
   ```bash
   pip install ultralytics roboflow opencv-python pymongo python-dotenv torch pyyaml
   ```
2. Create a `.env` file (copy `.env.example`) in the folder you run the scripts
   from, and fill in your own values:
   ```
   MONGO_URI=mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/
   ROBOFLOW_API_KEY=your_key_here
   ```
   Use only **one** `MONGO_URI` line. Prefer a password with letters and
   numbers only, so the URI does not need escaping.
3. The trained model is at `ai-service/weapon-detection/models/best.pt`.

### Run live detection (phone as camera)

1. Install **IP Webcam** on an Android phone and tap **Start server**.
2. Keep the phone and the laptop on the **same Wi-Fi** network.
3. In `live_test.py` set the stream URL to the one shown in the app:
   ```python
   URL = "http://<phone-ip>:8080/video"
   ```
4. Run:
   ```bash
   python live_test.py
   ```
   If the stream drops, the script reconnects automatically. Lower the
   resolution and FPS in the app for a smoother stream.

### Retrain the model

1. Edit the settings at the top of `retrain_weapon_detection.py`
   (`NEW_DATASET_VERSION`, `RUN_NAME`, `EPOCHS`, `IMGSZ`, `BATCH`, `PATIENCE`).
2. Make sure `ROBOFLOW_API_KEY` is set in your `.env`.
3. Run:
   ```bash
   python retrain_weapon_detection.py
   ```
   Training starts from the pretrained `yolov8n.pt` (not the old `best.pt`)
   and the best weights are saved in the run folder printed at the end.

### Security notes

- **Never commit `.env` or hard-code keys.** `ai-service/weapon-detection/.gitignore`
  already ignores `.env`.
- Read secrets only through environment variables, for example
  `os.getenv("ROBOFLOW_API_KEY")`.
- Use a limited database user (read/write to your database) for the app,
  not an admin user.
- If a key or password is ever exposed, rotate it immediately.

## Current Project Phase

**Phase 1:** Generic, location-agnostic crowd monitoring — upload/select a
video, get density + Safe/Crowded/Dangerous classification, live dashboard
updates, trend graph, and basic alerting.

**Weapon detection (added):** Live weapon detection (gun / knife / hazard
object) with detections stored in MongoDB.

**Phase 2 (later, if time permits):** Multi-zone / multi-camera support —
monitor several video sources at once and compare zones on one dashboard.

**Phase 3 (optional/bonus):** Contextual framing (e.g. named sample zones),
simulated alert routing. Clearly labeled as a conceptual/demo extension, not
a real integration with any external authority.

## Model Weights

- **Crowd density (CSRNet):** `PartAmodel_best.pth.tar` is **not** included
  (too large for GitHub without Git LFS). Place it in `ai-service/weights/`.
  See `ai-service/README.md`.
- **Weapon detection (YOLOv8):** `ai-service/weapon-detection/models/best.pt`
  **is** included (about 6 MB). `ai-service/yolov8n.pt` is the base
  pretrained model.
