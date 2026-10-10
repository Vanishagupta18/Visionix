"""
Visonix - Tier 1 / Tier 2 crowd monitor with hysteresis switching.

Tier 1 (always on):  YOLO person counting - cheap, runs every processed frame.
Tier 2 (gated):       CSRNet density estimation - only runs when triggered.

Switching logic (see tier_switcher.py). The YOLO -> CSRNet switch point
(CSRNET_SWITCH_COUNT = 40) is defined in risk_engine.py.

v3 display fix: CSRNet's count is only SHOWN when the switcher is actually in
CSRNET mode. A periodic safety check in YOLO mode still runs CSRNet, but its
number is only used as a signal for the switcher - it is not displayed. That
was why an empty scene flashed ~7 people every few seconds (CSRNet's
background noise on a sparse scene).

Run from the ai-service folder:

    (venv) PS D:\\visonix\\ai-service> python risk\\crowd_monitor.py
"""

import os
import sys

import cv2
from PIL import Image
from ultralytics import YOLO

sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
from main import predict_from_pil, classify  # noqa: E402

from tier_switcher import TierSwitcher  # noqa: E402

CAMERA_URL = "http://172.27.22.217:8080/video"   # or 0 for laptop webcam
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

            csrnet_count = None
            if run_csrnet:
                frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                pil_img = Image.fromarray(frame_rgb)
                csrnet_count = predict_from_pil(pil_img)["count"]
                # Close the loop - lets the switcher confirm/exit CSRNET mode
                switcher.report_csrnet_result(csrnet_count)

            # Decide what to DISPLAY, after the switcher has updated its mode.
            if switcher.mode == "CSRNET" and csrnet_count is not None:
                # YOLO's count is a hard lower bound (each box is a real person),
                # so never show fewer than YOLO actually detected.
                final_count = max(csrnet_count, yolo_count)
                source = f"CSRNet ({reason})"
            else:
                final_count = yolo_count
                source = "YOLO"
            final_status = classify(final_count)

            annotated = results[0].plot()
            label1 = f"Source: {source}  |  Count: {final_count}  |  {final_status}"
            label2 = f"Mode: {switcher.mode}  |  YOLO raw: {yolo_count}"
            if csrnet_count is not None and source == "YOLO":
                label2 += f"  |  CSRNet check: {csrnet_count} (not used)"
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