"""
Visonix - Video-file test harness for Tier 1 / Tier 2 switching.

Use this to validate the YOLO -> CSRNet switching logic on pre-recorded
footage (a sparse clip, a dense clip, or ideally one clip that goes from
sparse to dense) - no live crowd or awkward tablet-pointing needed.

Produces three things so you can properly verify the switching behaviour:
  1. An annotated output video with source/count/status/mode burned into
     each frame, plus a red "MODE SWITCHED" flag on the exact frame it flips.
  2. A console log, one line per processed frame, with a "<<< SWITCH" marker
     whenever the mode changes - so you can watch it happen without staring
     at the whole video.
  3. A CSV log (switching_log.csv) you can open in Excel/Sheets to review or
     graph count-over-time, and see the exact timestamp of every switch -
     good evidence to include in your report.

Run from the ai-service folder:
    (venv) PS D:\\visonix\\ai-service> python risk\\crowd_monitor_video.py
"""

import csv
import os
import sys

import cv2
from PIL import Image
from ultralytics import YOLO

# Make ai-service/ importable so we can reuse your existing, already-tested
# CSRNet pipeline instead of duplicating it.
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
from main import predict_from_pil, classify  # noqa: E402

from tier_switcher import TierSwitcher  # noqa: E402  (same folder, no path fix needed)

# ---------------------------------------------------------------------------
# CONFIG - point this at your own test video(s)
#
# These paths are anchored to THIS SCRIPT'S folder (ai-service/risk/), not to
# wherever your terminal's current directory happens to be - so it works
# whether you run it as `python risk\crowd_monitor_video.py` from ai-service,
# or `python crowd_monitor_video.py` from inside risk itself.
# ---------------------------------------------------------------------------
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

INPUT_VIDEO = os.path.join(SCRIPT_DIR, "test_videos", "video2.mp4")
OUTPUT_VIDEO = os.path.join(SCRIPT_DIR, "test_videos", "annotated_switching_output3.mp4")
LOG_CSV = os.path.join(SCRIPT_DIR, "test_videos", "switching_log.csv")

YOLO_CONF = 0.4
PROCESS_EVERY_N_FRAMES = 3


def main():
    print("Loading YOLO (Tier 1)...")
    yolo_model = YOLO("yolov8n.pt")
    person_id = [k for k, v in yolo_model.names.items() if v == "person"][0]

    print("Loading CSRNet (Tier 2, via your existing main.py)...")
    # The import above already triggered the CSRNet weights load once.

    if not os.path.exists(INPUT_VIDEO):
        print(f"ERROR: input video not found: {INPUT_VIDEO}")
        print("Update INPUT_VIDEO at the top of this file to match your actual filename")
        print(f"(it should sit in: {os.path.join(SCRIPT_DIR, 'test_videos')})")
        return

    cap = cv2.VideoCapture(INPUT_VIDEO)
    if not cap.isOpened():
        print(f"ERROR: could not open video file: {INPUT_VIDEO}")
        return

    fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    os.makedirs(os.path.dirname(OUTPUT_VIDEO), exist_ok=True)
    out = cv2.VideoWriter(OUTPUT_VIDEO, cv2.VideoWriter_fourcc(*"mp4v"), fps, (width, height))

    switcher = TierSwitcher()
    csv_file = open(LOG_CSV, "w", newline="")
    csv_writer = csv.writer(csv_file)
    csv_writer.writerow(["frame", "video_time_sec", "yolo_raw_count", "source",
                          "final_count", "status", "mode", "reason", "mode_changed"])

    print(f"Processing ~{total_frames} frames at {fps:.1f} fps ...\n")
    frame_num = 0
    prev_mode = switcher.mode

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        if frame_num % PROCESS_EVERY_N_FRAMES == 0:
            video_time_sec = frame_num / fps

            results = yolo_model(frame, conf=YOLO_CONF, verbose=False)
            yolo_count = sum(1 for c in results[0].boxes.cls if int(c) == person_id)

            # Pass VIDEO time (not wall-clock), so "every N seconds" means N
            # seconds of video content - correct regardless of how fast your
            # machine actually processes frames.
            run_csrnet, reason = switcher.decide(yolo_count, current_time=video_time_sec)

            if run_csrnet:
                frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                pil_img = Image.fromarray(frame_rgb)
                csrnet_result = predict_from_pil(pil_img)
                final_count = csrnet_result["count"]
                final_status = csrnet_result["status"]
                source = f"CSRNet ({reason})"
                # Feed the real measured count back into the state machine - this is
                # what lets a 'periodic' check that discovers a dense scene actually
                # latch the mode, instead of being forgotten after one frame.
                switcher.report_csrnet_result(final_count)
            else:
                final_count = yolo_count
                final_status = classify(yolo_count)
                source = "YOLO"

            mode_changed = switcher.mode != prev_mode
            prev_mode = switcher.mode

            annotated = results[0].plot()
            label1 = f"Source: {source}  |  Count: {final_count}  |  {final_status}"
            label2 = f"Mode: {switcher.mode}  |  YOLO raw: {yolo_count}  |  t={video_time_sec:.1f}s"
            cv2.putText(annotated, label1, (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.85, (255, 255, 255), 2)
            cv2.putText(annotated, label2, (20, 75), cv2.FONT_HERSHEY_SIMPLEX, 0.65, (200, 200, 0), 2)
            if mode_changed:
                cv2.putText(annotated, "*** MODE SWITCHED ***", (20, 110),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)

            out.write(annotated)

            marker = "  <<< SWITCH" if mode_changed else ""
            print(f"t={video_time_sec:6.1f}s  frame={frame_num:5d}  "
                  f"YOLO={yolo_count:3d}  ->  {source:22s}  count={final_count:3d}  "
                  f"{final_status:10s}  mode={switcher.mode}{marker}")

            csv_writer.writerow([frame_num, f"{video_time_sec:.2f}", yolo_count, source,
                                  final_count, final_status, switcher.mode, reason, mode_changed])
        else:
            out.write(frame)  # skipped frames written as-is, no re-detection

        frame_num += 1

    cap.release()
    out.release()
    csv_file.close()
    print(f"\nDone.")
    print(f"Annotated video: {OUTPUT_VIDEO}")
    print(f"Switching log:   {LOG_CSV}")


if __name__ == "__main__":
    main()