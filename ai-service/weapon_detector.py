"""
Visionix - Object/weapon-detection interface.

STATUS: disabled until a real weights file exists.
This module gives live_service.py a stable interface whether or not a
weapon/object model is loaded. It NEVER fabricates detections: with no
weights, detect_objects() always returns [] and is_available() is False.
"""

import os

_model = None
_available = False


def try_load(weights_path: str) -> bool:
    """Load a weapon/object model if the weights file really exists.
    Safe to call with a missing path - detection just stays disabled."""
    global _model, _available

    if not weights_path or not os.path.exists(weights_path):
        _available = False
        return False

    try:
        from ultralytics import YOLO
        _model = YOLO(weights_path)
        _available = True
        print(f"[Visionix AI] Weapon/object model loaded from {weights_path}")
    except Exception as e:
        print(f"[Visionix AI] Failed to load weapon/object model: {e}")
        _available = False

    return _available


def is_available() -> bool:
    return _available


def detect_objects(frame) -> list:
    """Returns [{className, confidence, bbox}]. Always [] when no real model is loaded."""
    if not _available or _model is None:
        return []

    results = _model(frame, verbose=False)
    detections = []
    for box in results[0].boxes:
        cls_id = int(box.cls[0])
        x1, y1, x2, y2 = [float(v) for v in box.xyxy[0]]
        detections.append({
            "className": _model.names.get(cls_id, str(cls_id)),
            "confidence": round(float(box.conf[0]), 3),
            "bbox": {"x1": round(x1, 1), "y1": round(y1, 1), "x2": round(x2, 1), "y2": round(y2, 1)},
        })
    return detections