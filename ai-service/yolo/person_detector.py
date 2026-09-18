"""
Visionix - Live person detection from a phone camera (Phase 1)
Phone (IP Webcam app) -> Wi-Fi -> OpenCV -> YOLOv8n -> person count -> live window
"""

import cv2
import time
from ultralytics import YOLO

# ---- CONFIG - edit these two lines for your setup ----
CAMERA_URL = "http://192.168.29.128:8080/video"   # replace with YOUR phone's IP Webcam URL
CONF_THRESHOLD = 0.4                              # same threshold you tuned in Colab

# Simple placeholder status thresholds - TUNE these using your own test footage,
# same way you found your CSRNet switch threshold. Not a real risk calculation yet,
# just a visible label for the demo.
CROWDED_THRESHOLD = 15
DENSE_THRESHOLD = 30


def main():
    print("Loading YOLO model...")
    model = YOLO("yolov8n.pt")
    person_id = [k for k, v in model.names.items() if v == "person"][0]

    print(f"Connecting to phone camera at {CAMERA_URL} ...")
    cap = cv2.VideoCapture(CAMERA_URL)

    if not cap.isOpened():
        print("ERROR: Could not connect to phone camera.")
        print("Check that:")
        print("  1. The IP Webcam app is running and 'Start server' was tapped")
        print("  2. Your phone and laptop are on the SAME Wi-Fi network")
        print("  3. The URL above matches exactly what the app shows on screen")
        return

    print("Connected. Press 'q' in the video window to quit.\n")

    prev_time = time.time()
    fps_display = 0.0

    while True:
        ret, frame = cap.read()
        if not ret:
            print("Lost connection to camera stream — stopping.")
            break

        results = model(frame, conf=CONF_THRESHOLD, verbose=False)
        result = results[0]
        person_count = sum(1 for c in result.boxes.cls if int(c) == person_id)

        annotated = result.plot()  # BGR - correct format for cv2.imshow, no conversion needed

        # --- status label (placeholder logic, see CONFIG note above) ---
        if person_count >= DENSE_THRESHOLD:
            status, color = "DENSE CROWD", (0, 0, 255)      # red
        elif person_count >= CROWDED_THRESHOLD:
            status, color = "CROWDED", (0, 165, 255)         # orange
        else:
            status, color = "NORMAL", (0, 255, 0)            # green

        # --- FPS calculation (real measured number, not a claim) ---
        now = time.time()
        instant_fps = 1.0 / max(now - prev_time, 1e-6)
        fps_display = 0.9 * fps_display + 0.1 * instant_fps  # smoothed
        prev_time = now

        cv2.putText(annotated, f"People: {person_count}", (20, 45),
                    cv2.FONT_HERSHEY_SIMPLEX, 1.1, (255, 255, 255), 3)
        cv2.putText(annotated, f"Status: {status}", (20, 85),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.9, color, 2)
        cv2.putText(annotated, f"FPS: {fps_display:.1f}", (20, 120),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (200, 200, 200), 2)

        cv2.imshow("Visionix - Live Person Detection", annotated)

        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    main()