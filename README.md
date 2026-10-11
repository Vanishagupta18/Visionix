# Visionix — AI Crowd Monitoring System

AI-powered crowd safety system that analyses video/CCTV footage in real time,
estimates crowd density, classifies risk levels and raises alerts **before**
dangerous overcrowding occurs. Visionix also includes a weapon detection
module that flags guns, knives and other hazardous objects from a live camera
feed.

## Problem

Large gatherings (stations, events, public places) are hard to watch manually.
Overcrowding and security threats are usually noticed only after they become
dangerous. Visionix watches the video feeds continuously and warns operators
early, so they can act in time.

## Key Features

- **Crowd density estimation** from video using CSRNet, with a people count per frame
- **Risk classification** into Safe / Crowded / Dangerous, with tier switching between monitoring modes
- **Person detection** using YOLO
- **Weapon detection** (gun, knife, hazard object) from live camera feeds
- **Alerts and storage** — readings, alerts and detections are saved in MongoDB
- **Live dashboard** with zone status, trend graphs and an alerts panel (React)

## System Architecture

```
Video / CCTV / Camera feed
          │
          ▼
  ai-service (Python, FastAPI)
  - CSRNet crowd density + count
  - Risk monitoring and tier switching
  - YOLO person detection
  - Weapon detection (YOLOv8)
          │
          ▼
  backend (Node.js, Express, MongoDB)
  - saves readings, alerts and detections
  - checks alert rules
  - pushes live updates via Socket.io
          │
          ▼
  frontend (React dashboard)
  - live zone status
  - trend graphs
  - alerts panel
```

## Repository Structure

```
visionix/
├── ai-service/            → Python AI services
│   ├── main.py, model.py, utils.py   → FastAPI app + CSRNet crowd density
│   ├── risk/                         → crowd risk monitoring and tier switching
│   ├── yolo/                         → YOLO person detector
│   ├── weapon_detector.py            → weapon detection hook for the service
│   └── weapon-detection/             → weapon detection module (see its folder)
├── backend/               → Node.js + Express + MongoDB (API, alerts, storage)
├── frontend/              → React dashboard
└── README.md
```

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| AI | Python, FastAPI, PyTorch, CSRNet, YOLOv8 (Ultralytics), OpenCV |
| Backend | Node.js, Express, MongoDB (Atlas), Socket.io |
| Frontend | React |
| Data / training | Roboflow datasets for weapon detection |

## Getting Started (Order Matters)

1. **AI Service first** — see `ai-service/README.md`.
2. **Backend second** — see `backend/README.md`.
3. **Frontend last** — see `frontend/README.md`.

Each service reads its settings from its own `.env` file. Copy the
`.env.example` in that folder and fill in your own values. Never commit a
real `.env`.

## Modules

### Crowd Density and Risk Monitoring
Estimates the number of people in a frame with CSRNet and converts it into a
Safe / Crowded / Dangerous status. The `risk/` folder holds the monitoring and
tier switching logic, and `yolo/` the person detector.

### Weapon Detection
A YOLOv8 model detects three classes: `gun`, `hazard_object` and `knife`.
It works on live camera feeds (for example a phone running IP Webcam), video
files and YouTube videos, and saves detections to MongoDB. The trained weights
are at `ai-service/weapon-detection/models/best.pt`. Setup, live testing and
retraining steps are in the `ai-service/weapon-detection/` folder.

### Backend and Alerts
Receives results from the AI service, stores them in MongoDB, applies alert
rules and pushes live updates to the dashboard.

### Dashboard
Shows live zone status, trend graphs and the alerts panel.

## Project Phases

**Phase 1 (core):** Generic, location-agnostic crowd monitoring — upload or
select a video, get density plus Safe/Crowded/Dangerous classification, live
dashboard updates, trend graph and basic alerting.

**Added:** Weapon detection from live camera feeds with detections stored in
MongoDB.

**Phase 2 (later, if time permits):** Multi-zone and multi-camera support —
monitor several video sources at once and compare zones on one dashboard.

**Phase 3 (optional/bonus):** Contextual framing (e.g. named sample zones),
simulated alert routing. Clearly labeled as a conceptual/demo extension, not
a real integration with any external authority.

## Model Weights

- **Crowd density (CSRNet):** `PartAmodel_best.pth.tar` is **not** included
  (too large for GitHub without Git LFS). Place it in `ai-service/weights/`.
  See `ai-service/README.md`.
- **Weapon detection (YOLOv8):** `ai-service/weapon-detection/models/best.pt`
  is included in the repo (about 6 MB). `ai-service/yolov8n.pt` is the base
  pretrained model.

## Security Notes

- Keep all keys and database passwords in `.env` files and read them through
  environment variables. Never hard-code them or commit them.
- Use a limited database user (read/write on your database) for the app, not
  an admin user.
- If a key or password is ever exposed, rotate it immediately.
