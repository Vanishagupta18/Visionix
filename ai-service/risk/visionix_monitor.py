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
import contextlib
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
from risk_engine import compute_risk  # noqa: E402

# ---------------------------------------------------------------------------
# CONFIG
# ---------------------------------------------------------------------------
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

# Your phone's IP Webcam URL - CHANGE THIS to whatever the app shows you.
CAMERA_URL = "http://192.168.1.105:8080/video"

YOLO_CONF = 0.4
PROCESS_EVERY_N_FRAMES = 3   # raise to 5 or 6 if live feed feels laggy

DISPLAY_WIDTH = 960          # live-preview window width; height auto-scales to match aspect ratio
WINDOW_NAME = "Visionix - Live Crowd Monitor"

OUTPUT_DIR = os.path.join(SCRIPT_DIR, "test_videos")


def resize_for_display(img, target_width=DISPLAY_WIDTH):
    """Scale the annotated frame to a fixed display width, preserving aspect
    ratio. Without this, cv2.imshow draws the frame at its native camera
    resolution and leaves the rest of the window blank/grey if the window
    has been resized or maximized - this keeps the preview consistent."""
    h, w = img.shape[:2]
    if w == 0:
        return img
    scale = target_width / w
    new_size = (target_width, max(1, int(h * scale)))
    return cv2.resize(img, new_size, interpolation=cv2.INTER_LINEAR)


# ---------------------------------------------------------------------------
# Shared per-frame processing - identical logic for live and video, so the
# demo behaves exactly the same way as the tested recorded runs.
# ---------------------------------------------------------------------------
def process_frame(frame, yolo_model, person_id, switcher, current_time,
                   zone_area_sqm=None, csrnet_lock=None):
    """Run Tier 1 (always) + Tier 2 (only if the switcher says so).
    Returns a dict of everything needed for display/logging.

    zone_area_sqm: real-world area (m^2) this camera's frame covers - passed
        through to the risk engine. Omit to use risk_engine.ZONE_AREA_SQM.
    csrnet_lock: a threading.Lock, required when multiple zone threads share
        the one CSRNet model loaded in main.py. Omit for single-zone use -
        harmless either way, just unnecessary there.
    """

    # ---- TIER 1: YOLO, every processed frame ----
    results = yolo_model(frame, conf=YOLO_CONF, verbose=False)
    yolo_count = sum(1 for c in results[0].boxes.cls if int(c) == person_id)

    # ---- DECISION LAYER ----
    run_csrnet, reason = switcher.decide(yolo_count, current_time=current_time)
    # Capture the mode THIS frame actually used, right now - not after
    # report_csrnet_result() below, which can flip switcher.mode for the
    # NEXT frame's decide() call. Reading switcher.mode any later than this
    # would show a mode that doesn't match `reason` (e.g. reason="sustained"
    # next to mode="YOLO" on the exact frame the exit condition fires).
    mode_this_frame = switcher.mode

    # ---- TIER 2: CSRNet, only when triggered ----
    if run_csrnet:
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        pil_img = Image.fromarray(frame_rgb)
        lock_ctx = csrnet_lock if csrnet_lock is not None else contextlib.nullcontext()
        with lock_ctx:  # serialize access to the one shared CSRNet model across zone threads
            csrnet_result = predict_from_pil(pil_img)
        final_count = csrnet_result["count"]
        final_status = csrnet_result["status"]
        source = f"CSRNet ({reason})"
        # Feed the measured count back so a 'periodic' discovery can latch the
        # mode, and so exiting CSRNET mode is judged on CSRNet's own number.
        # NOTE: this can change switcher.mode - intentionally applies to the
        # NEXT frame's decide() call, not this one (see mode_this_frame above).
        switcher.report_csrnet_result(final_count)
    else:
        final_count = yolo_count
        final_status = classify(yolo_count)
        source = "YOLO"

    # ---- RISK ENGINE ----
    # Only density is a real signal right now - motion_ratio and
    # weapon_detected stay at their defaults (no elevated motion, no
    # weapon) until those detectors are built. See risk_engine.py.
    from risk_engine import ZONE_AREA_SQM  # local import avoids a circular-import risk
    area = zone_area_sqm if zone_area_sqm is not None else ZONE_AREA_SQM
    risk_score, risk_label, risk_breakdown = compute_risk(final_count, zone_area_sqm=area)

    return {
        "annotated": results[0].plot(),   # BGR - correct for cv2.imshow / VideoWriter
        "yolo_count": yolo_count,
        "final_count": final_count,
        "final_status": final_status,
        "source": source,
        "reason": reason,
        "mode": mode_this_frame,
        "risk_score": risk_score,
        "risk_label": risk_label,
        "risk_breakdown": risk_breakdown,
    }


def draw_overlay(r, current_time, fps_display=None, mode_changed=False, zone_name=None):
    """Draw the status text onto the annotated frame (in place)."""
    img = r["annotated"]

    if zone_name:
        # Title banner - solid strip across the top so it stays readable
        # over any background, even after the frame gets shrunk for tiling.
        cv2.rectangle(img, (0, 0), (img.shape[1], 34), (40, 40, 40), -1)
        cv2.putText(img, zone_name, (10, 25), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)

    status_colors = {
        "Safe": (0, 255, 0),
        "Crowded": (0, 165, 255),
        "Dangerous": (0, 0, 255),
    }
    color = status_colors.get(r["final_status"], (255, 255, 255))

    risk_colors = {
        "Safe": (0, 255, 0),
        "Warning": (0, 200, 255),
        "High Risk": (0, 140, 255),
        "Critical": (0, 0, 255),
    }
    risk_color = risk_colors.get(r["risk_label"], (255, 255, 255))

    y_offset = 34 if zone_name else 0  # shift everything down below the banner strip

    cv2.putText(img, f"Source: {r['source']}  |  Count: {r['final_count']}",
                (20, 40 + y_offset), cv2.FONT_HERSHEY_SIMPLEX, 0.85, (255, 255, 255), 2)
    cv2.putText(img, f"Status: {r['final_status']}",
                (20, 78 + y_offset), cv2.FONT_HERSHEY_SIMPLEX, 0.85, color, 2)
    cv2.putText(img, f"Risk: {r['risk_score']:.0f}%  ({r['risk_label']})",
                (20, 116 + y_offset), cv2.FONT_HERSHEY_SIMPLEX, 0.85, risk_color, 2)

    line4 = f"Mode: {r['mode']}  |  YOLO raw: {r['yolo_count']}  |  t={current_time:.1f}s"
    if fps_display is not None:
        line4 += f"  |  FPS: {fps_display:.1f}"
    cv2.putText(img, line4, (20, 150 + y_offset), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (200, 200, 0), 2)

    if mode_changed:
        cv2.putText(img, "*** MODE SWITCHED ***", (20, 184 + y_offset),
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

    # Ask the camera for a decent resolution (webcams often default to a low
    # 640x480 unless asked). Harmless if the source ignores it (e.g. phone stream).
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)

    # WINDOW_NORMAL (not the default AUTOSIZE) + an explicit fixed size stops
    # the window from being left larger than the frame with blank grey space
    # around it - the exact issue in the screenshot.
    cv2.namedWindow(WINDOW_NAME, cv2.WINDOW_NORMAL)
    window_sized = False

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
            img = resize_for_display(img)

            if not window_sized:
                # Lock the window to exactly match the (now-fixed) display size,
                # once, using the real frame - no more guessing/blank space.
                h, w = img.shape[:2]
                cv2.resizeWindow(WINDOW_NAME, w, h)
                window_sized = True

            cv2.imshow(WINDOW_NAME, img)

            if mode_changed:
                print(f"  <<< MODE SWITCHED to {r['mode']}  "
                      f"(YOLO={r['yolo_count']}, final={r['final_count']}, "
                      f"{r['final_status']}, risk={r['risk_score']:.0f}% {r['risk_label']})")

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
                         "final_count", "status", "risk_score", "risk_label",
                         "mode", "reason", "mode_changed"])

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
                  f"risk={r['risk_score']:5.1f}% ({r['risk_label']:9s})  "
                  f"mode={r['mode']}{marker}")

            csv_writer.writerow([frame_num, f"{video_time_sec:.2f}", r["yolo_count"],
                                 r["source"], r["final_count"], r["final_status"],
                                 r["risk_score"], r["risk_label"],
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