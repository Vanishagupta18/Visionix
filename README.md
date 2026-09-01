# Visonix — AI Crowd Monitoring System

AI-powered crowd density monitoring system that estimates crowd density from
video/CCTV footage in real time and raises alerts before dangerous
overcrowding occurs.

This repository is split into three independent services:

```
visonix/
├── ai-service/     → Python + FastAPI + CSRNet (crowd density AI)
├── backend/         → Node.js + Express + MongoDB (main API, alerts, storage)
├── frontend/        → React (dashboard UI)
└── README.md
```

## How the pieces connect

```
Video/Frame → ai-service (FastAPI, CSRNet) → count + status
                        │
                        ▼
                 backend (Node/Express)
                 - saves reading to MongoDB
                 - checks alert rules
                 - pushes update via Socket.io
                        │
                        ▼
                 frontend (React dashboard)
                 - live zone status
                 - trend graphs
                 - alerts panel
```

## Getting Started (Order Matters)

### 1. AI Service first (this is already tested logic from Colab)
See `ai-service/README.md`.

### 2. Backend second
See `backend/README.md`.

### 3. Frontend last
See `frontend/README.md`.

## Current Project Phase

**Phase 1 (current focus):** Generic, location-agnostic crowd monitoring —
upload/select a video, get density + Safe/Crowded/Dangerous classification,
see it on a dashboard with live updates, trend graph, and basic alerting.

**Phase 2 (later, if time permits):** Multi-zone support — monitor several
video sources at once, compare zones on one dashboard.

**Phase 3 (optional/bonus):** Contextual framing (e.g. named sample zones),
simulated alert routing. Clearly labeled as a conceptual/demo extension, not
a real integration with any external authority.

## Model Weights

The CSRNet pretrained weights file (`PartAmodel_best.pth.tar`) is **not**
included in this repo (too large for GitHub without Git LFS). Place your
downloaded weights file inside `ai-service/weights/` before running the AI
service. See `ai-service/README.md` for details.
