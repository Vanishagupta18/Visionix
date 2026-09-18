r"""
Visonix - Unified Tier 1 / Tier 2 crowd monitor.

ONE script for BOTH demo modes:

  LIVE  (phone IP-camera or laptop webcam) -> on-screen window, for the viva demo
  VIDEO (recorded .mp4 file)               -> annotated output video + CSV log

--------------------------------------------------------------------------
HOW TO RUN
--------------------------------------------------------------------------
Always run from the ai-service folder, with venv active:

  Live from phone (IP Webcam app):
      python risk\visionix_monitor.py --mode live

  Live from laptop webcam:
      python risk\visionix_monitor.py --mode live --source 0

  Recorded video:
      python risk\visionix_monitor.py --mode video --source test_videos\dense_crowd_test.mp4

  Just use defaults (live from CAMERA_URL below):
      python risk\visionix_monitor.py

--------------------------------------------------------------------------
ARCHITECTURE
--------------------------------------------------------------------------
Every processed frame:
    YOLO runs ALWAYS               (Tier 1 - cheap; also where weapon/fight
                                    detection will plug in later)
        -> yolo_count
    switcher.decide(yolo_count)    -> should CSRNet run this frame?
        -> if yes: CSRNet runs     (Tier 2 - expensive, only when needed)
                   and its count is reported BACK to the switcher

YOLO and CSRNet do NOT both run on every frame. In a normal scene CSRNet
runs only once every PERIODIC_CHECK_INTERVAL_SEC seconds as a safety check.
"""

import argparse
import csv
import os
import sys
import time

import cv2
from PIL import Image
from ultralytics import YOLO

# Make ai-service/ importable so we reuse the existing, already-tested CSRNet
# pipeline in main.py rather than duplicating it.
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
from main import predict_from_pil, classify  # noqa: E402

from tier_switcher import TierSwitcher  # noqa: E402

# ---------------------------------------------------------------------------
# CONFIG
# ---------------------------------------------------------------------------
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

# Your phone's IP Webcam URL - CHANGE THIS to whatever the app shows you.
CAMERA_URL = "http://192.168.29.128:8080/video"

YOLO_CONF = 0.4
PROCESS_EVERY_N_FRAMES = 3   # raise to 5 or 6 if live feed feels laggy

OUTPUT_DIR = os.path.join(SCRIPT_DIR, "test_videos")


# ---------------------------------------------------------------------------
# Shared per-frame processing - identical logic for live and video, so the
# demo behaves exactly the same way as the tested recorded runs.
# ---------------------------------------------------------------------------
def process_frame(frame, yolo_model, person_id, switcher, current_time):
    """Run Tier 1 (always) + Tier 2 (only if the switcher says so).
    Returns a dict of everything needed for display/logging."""

    # ---- TIER 1: YOLO, every processed frame ----
    results = yolo_model(frame, conf=YOLO_CONF, verbose=False)
    yolo_count = sum(1 for c in results[0].boxes.cls if int(c) == person_id)

    # ---- DECISION LAYER ----
    run_csrnet, reason = switcher.decide(yolo_count, current_time=current_time)

    # ---- TIER 2: CSRNet, only when triggered ----
    if run_csrnet:
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        pil_img = Image.fromarray(frame_rgb)
        csrnet_result = predict_from_pil(pil_img)
        final_count = csrnet_result["count"]
        final_status = csrnet_result["status"]
        source = f"CSRNet ({reason})"
        # Feed the measured count back so a 'periodic' discovery can latch the
        # mode, and so exiting CSRNET mode is judged on CSRNet's own number.
        switcher.report_csrnet_result(final_count)
    else:
        final_count = yolo_count
        final_status = classify(yolo_count)
        source = "YOLO"

    return {
        "annotated": results[0].plot(),   # BGR - correct for cv2.imshow / VideoWriter
        "yolo_count": yolo_count,
        "final_count": final_count,
        "final_status": final_status,
        "source": source,
        "reason": reason,
        "mode": switcher.mode,
    }


def draw_overlay(r, current_time, fps_display=None, mode_changed=False):
    """Draw the status text onto the annotated frame (in place)."""
    img = r["annotated"]

    status_colors = {
        "Safe": (0, 255, 0),
        "Crowded": (0, 165, 255),
        "Dangerous": (0, 0, 255),
    }
    color = status_colors.get(r["final_status"], (255, 255, 255))

    cv2.putText(img, f"Source: {r['source']}  |  Count: {r['final_count']}",
                (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.85, (255, 255, 255), 2)
    cv2.putText(img, f"Status: {r['final_status']}",
                (20, 78), cv2.FONT_HERSHEY_SIMPLEX, 0.85, color, 2)

    line3 = f"Mode: {r['mode']}  |  YOLO raw: {r['yolo_count']}  |  t={current_time:.1f}s"
    if fps_display is not None:
        line3 += f"  |  FPS: {fps_display:.1f}"
    cv2.putText(img, line3, (20, 112), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (200, 200, 0), 2)

    if mode_changed:
        cv2.putText(img, "*** MODE SWITCHED ***", (20, 148),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
    return img


# ---------------------------------------------------------------------------
# LIVE MODE - phone camera or webcam, on-screen window
# ---------------------------------------------------------------------------
def run_live(source, yolo_model, person_id):
    print(f"Connecting to: {source}")
    cap = cv2.VideoCapture(source)

    if not cap.isOpened():
        print("\nERROR: Could not connect to camera.")
        print("  1. Is the IP Webcam app running with 'Start server' tapped?")
        print("  2. Are phone and laptop on the SAME Wi-Fi?")
        print("  3. Does the URL open in your laptop browser?")
        print("  (For laptop webcam instead, use: --source 0)")
        return

    print("Connected. Press 'q' in the video window to quit.\n")

    switcher = TierSwitcher()
    frame_num = 0
    prev_mode = switcher.mode
    prev_time = time.time()
    fps_display = 0.0

    while True:
        ret, frame = cap.read()
        if not ret:
            print("Lost connection to stream - stopping.")
            break

        if frame_num % PROCESS_EVERY_N_FRAMES == 0:
            # Live uses real wall-clock time for the periodic timer.
            r = process_frame(frame, yolo_model, person_id, switcher, current_time=time.time())

            mode_changed = r["mode"] != prev_mode
            prev_mode = r["mode"]

            now = time.time()
            fps_display = 0.9 * fps_display + 0.1 * (1.0 / max(now - prev_time, 1e-6))
            prev_time = now

            img = draw_overlay(r, current_time=now % 1000, fps_display=fps_display,
                               mode_changed=mode_changed)
            cv2.imshow("Visionix - Live Crowd Monitor", img)

            if mode_changed:
                print(f"  <<< MODE SWITCHED to {r['mode']}  "
                      f"(YOLO={r['yolo_count']}, final={r['final_count']}, {r['final_status']})")

        if cv2.waitKey(1) & 0xFF == ord("q"):
            break
        frame_num += 1

    cap.release()
    cv2.destroyAllWindows()


# ---------------------------------------------------------------------------
# VIDEO MODE - recorded file, annotated output + CSV log
# ---------------------------------------------------------------------------
def run_video(source, yolo_model, person_id):
    if not os.path.isabs(source):
        source = os.path.join(SCRIPT_DIR, source)

    if not os.path.exists(source):
        print(f"ERROR: input video not found: {source}")
        print(f"(videos should sit in: {OUTPUT_DIR})")
        return

    cap = cv2.VideoCapture(source)
    if not cap.isOpened():
        print(f"ERROR: could not open video: {source}")
        return

    fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    base = os.path.splitext(os.path.basename(source))[0]
    out_path = os.path.join(OUTPUT_DIR, f"annotated_{base}.mp4")
    log_path = os.path.join(OUTPUT_DIR, f"log_{base}.csv")

    out = cv2.VideoWriter(out_path, cv2.VideoWriter_fourcc(*"mp4v"), fps, (width, height))

    switcher = TierSwitcher()
    csv_file = open(log_path, "w", newline="")
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
            # Video uses VIDEO time, so "every N seconds" means N seconds of
            # content - independent of how fast your machine processes it.
            video_time_sec = frame_num / fps
            r = process_frame(frame, yolo_model, person_id, switcher,
                              current_time=video_time_sec)

            mode_changed = r["mode"] != prev_mode
            prev_mode = r["mode"]

            img = draw_overlay(r, current_time=video_time_sec, mode_changed=mode_changed)
            out.write(img)

            marker = "  <<< SWITCH" if mode_changed else ""
            print(f"t={video_time_sec:6.1f}s  frame={frame_num:5d}  "
                  f"YOLO={r['yolo_count']:3d}  ->  {r['source']:22s}  "
                  f"count={r['final_count']:3d}  {r['final_status']:10s}  "
                  f"mode={r['mode']}{marker}")

            csv_writer.writerow([frame_num, f"{video_time_sec:.2f}", r["yolo_count"],
                                 r["source"], r["final_count"], r["final_status"],
                                 r["mode"], r["reason"], mode_changed])
        else:
            out.write(frame)

        frame_num += 1

    cap.release()
    out.release()
    csv_file.close()
    print(f"\nDone.")
    print(f"Annotated video: {out_path}")
    print(f"Switching log:   {log_path}")


# ---------------------------------------------------------------------------
def main():
    parser = argparse.ArgumentParser(description="Visionix Tier 1/Tier 2 crowd monitor")
    parser.add_argument("--mode", choices=["live", "video"], default="live",
                        help="live = camera window (demo); video = process a file")
    parser.add_argument("--source", default=None,
                        help="live: IP Webcam URL or 0 for laptop webcam. "
                             "video: path to .mp4")
    args = parser.parse_args()

    print("Loading YOLO (Tier 1)...")
    yolo_model = YOLO("yolov8n.pt")
    person_id = [k for k, v in yolo_model.names.items() if v == "person"][0]
    print("Loading CSRNet (Tier 2, via main.py)...")

    if args.mode == "live":
        source = args.source if args.source is not None else CAMERA_URL
        if str(source).isdigit():      # "0" -> laptop webcam
            source = int(source)
        run_live(source, yolo_model, person_id)
    else:
        if args.source is None:
            print("ERROR: --mode video needs --source path\\to\\video.mp4")
            return
        run_video(args.source, yolo_model, person_id)


if __name__ == "__main__":
    main()