"""
Visonix - Tier 1 / Tier 2 crowd monitor with hysteresis switching.

Tier 1 (always on):  YOLO person counting - cheap, runs every processed frame.
Tier 2 (gated):       CSRNet density estimation - only runs when triggered.

Switching logic (see architecture doc, Sections 9-10):
  - Two thresholds, not one (hysteresis) -> prevents flicker right at the boundary.
  - Requires N consecutive frames before switching either direction (debounce)
    -> a single noisy frame can't flip the mode.
  - A periodic mandatory CSRNet check runs regardless of YOLO's count
    -> safety net for YOLO undercounting in very dense crowds.

Run from the ai-service folder so yolov8n.pt caches in one place and the
weights/ path in main.py resolves correctly:

    (venv) PS D:\\visonix\\ai-service> python risk\\crowd_monitor.py
"""

import os
import sys

import cv2
from PIL import Image
from ultralytics import YOLO

# Make ai-service/ (the parent of this risk/ folder) importable, so we can
# reuse your existing, already-tested CSRNet pipeline instead of duplicating it.
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
from main import predict_from_pil, classify  # noqa: E402  (import after sys.path fix, intentional)

from tier_switcher import TierSwitcher  # noqa: E402  (same folder, shared with crowd_monitor_video.py)

# ---------------------------------------------------------------------------
# CONFIG specific to the live-camera entry point.
# The switching thresholds (ENTER/EXIT/PERIODIC_CHECK) now live in
# tier_switcher.py, shared with crowd_monitor_video.py - edit them there.
# ---------------------------------------------------------------------------

CAMERA_URL = "http://192.168.1.105:8080/video"   # or 0 for laptop webcam
YOLO_CONF = 0.4
PROCESS_EVERY_N_FRAMES = 3


def main():
    print("Loading YOLO (Tier 1)...")
    yolo_model = YOLO("yolov8n.pt")
    person_id = [k for k, v in yolo_model.names.items() if v == "person"][0]

    print("Loading CSRNet (Tier 2, via your existing main.py)...")
    # Importing main.py above already triggered the CSRNet weights load once.

    switcher = TierSwitcher()

    print(f"Connecting to {CAMERA_URL} ...")
    cap = cv2.VideoCapture(CAMERA_URL)
    if not cap.isOpened():
        print("ERROR: could not open camera/video source. Check Wi-Fi / URL, same as before.")
        return

    print("Connected. Press 'q' to quit.\n")
    frame_num = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            print("Lost connection to stream - stopping.")
            break

        if frame_num % PROCESS_EVERY_N_FRAMES == 0:
            results = yolo_model(frame, conf=YOLO_CONF, verbose=False)
            yolo_count = sum(1 for c in results[0].boxes.cls if int(c) == person_id)

            run_csrnet, reason = switcher.decide(yolo_count)

            if run_csrnet:
                frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                pil_img = Image.fromarray(frame_rgb)
                csrnet_result = predict_from_pil(pil_img)
                final_count = csrnet_result["count"]
                final_status = csrnet_result["status"]
                source = f"CSRNet ({reason})"
                # Close the loop - lets a periodic check latch the mode (see tier_switcher.py)
                switcher.report_csrnet_result(final_count)
            else:
                final_count = yolo_count
                final_status = classify(yolo_count)  # reuses your exact Safe/Crowded/Dangerous bands
                source = "YOLO"

            annotated = results[0].plot()
            label1 = f"Source: {source}  |  Count: {final_count}  |  {final_status}"
            label2 = f"Mode: {switcher.mode}  |  YOLO raw count: {yolo_count}"
            cv2.putText(annotated, label1, (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.85, (255, 255, 255), 2)
            cv2.putText(annotated, label2, (20, 75), cv2.FONT_HERSHEY_SIMPLEX, 0.65, (200, 200, 0), 2)

            cv2.imshow("Visionix - Tier 1/Tier 2 Switching", annotated)

        if cv2.waitKey(1) & 0xFF == ord("q"):
            break
        frame_num += 1

    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    main()