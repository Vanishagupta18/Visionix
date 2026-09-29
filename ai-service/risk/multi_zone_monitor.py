r"""
Visonix - Multi-zone crowd monitor.

Runs Tier 1/Tier 2 monitoring for SEVERAL zones at once - each zone is its
own camera (phone/webcam) or its own recorded video file - and shows a
combined tiled dashboard with a colour-coded status per zone.

Reuses process_frame() / draw_overlay() from visionix_monitor.py, so the
detection and switching logic is identical to your single-zone testing -
nothing new to re-validate, just running several copies of it at once.

--------------------------------------------------------------------------
CONFIGURE YOUR ZONES BELOW before running.
--------------------------------------------------------------------------

--------------------------------------------------------------------------
HOW TO RUN (from the ai-service folder, venv active)
--------------------------------------------------------------------------
  Live, 2-3 phone/webcam feeds:
      python risk\multi_zone_monitor.py --mode live

  Recorded video, one file per zone:
      python risk\multi_zone_monitor.py --mode video

  Press 'q' in the live window to quit. Video mode runs until every zone's
  clip finishes, then exits on its own.

--------------------------------------------------------------------------
ARCHITECTURE
--------------------------------------------------------------------------
One background thread per zone: its own capture source, its own YOLO model
instance (each thread gets its own - avoids any shared-model thread-safety
question entirely), its own TierSwitcher (each zone's dense/normal state is
completely independent - Zone 1 going CSRNET must never affect Zone 2).

CSRNet, unlike YOLO, IS shared (main.py loads it once globally) - a single
threading.Lock() serializes access so two zones can never call it at the
exact same instant. This costs nothing extra on a CPU-bound laptop anyway
(you can't truly run two heavy CPU model calls in parallel regardless), so
the lock only adds safety, not slowdown.

Worker threads NEVER call cv2.imshow - only the MAIN thread does, reading
whatever each worker's latest result is. Mixing GUI calls across threads is
a common source of OpenCV crashes on Windows; this design avoids it.
"""

import argparse
import os
import sys
import threading
import time

import cv2
import numpy as np
from ultralytics import YOLO

sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

from tier_switcher import TierSwitcher  # noqa: E402
from visionix_monitor import process_frame, draw_overlay, resize_for_display  # noqa: E402

# ---------------------------------------------------------------------------
# CONFIGURE YOUR ZONES HERE
# ---------------------------------------------------------------------------
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(SCRIPT_DIR, "test_videos")

# LIVE: one entry per phone (IP Webcam URL) or 0 for the laptop webcam.
# area_sqm: measure each physical space - see risk_engine.py notes.
LIVE_ZONES = [
    {"name": "Zone 1 - Entrance", "source": "http://192.168.29.128:8080/video", "area_sqm": 40.0},
    {"name": "Zone 2 - Main Hall", "source": "http://192.168.29.175:8080/video", "area_sqm": 100.0},
    # {"name": "Zone 3 - Exit",     "source": 0,                                 "area_sqm": 25.0},
]

# VIDEO: one recorded clip per zone, paths relative to this script's folder.
VIDEO_ZONES = [
    {"name": "Zone 1", "source": "test_videos/zone1.mp4", "area_sqm": 40.0},
    {"name": "Zone 2", "source": "test_videos/zone2.mp4", "area_sqm": 100.0},
    {"name": "Zone 3", "source": "test_videos/zone3.mp4", "area_sqm": 25.0},
]

YOLO_CONF = 0.4
# Higher than the single-zone default (3) - running several zones at once on
# one CPU needs each one to do less work per second. Raise further (6-8) if
# the live tiled window still feels laggy with all your zones running.
PROCESS_EVERY_N_FRAMES = 5

TILE_WIDTH = 480          # each zone's tile width in the combined live window
DISPLAY_REFRESH_SEC = 0.05

csrnet_lock = threading.Lock()   # shared CSRNet model (main.py) - see module docstring
state_lock = threading.Lock()    # protects shared_state below
shared_state = {}                # zone_name -> latest result dict
csv_lock = threading.Lock()      # protects the combined CSV in video mode


# ---------------------------------------------------------------------------
def zone_worker_live(zone_cfg, stop_event):
    name = zone_cfg["name"]
    source = zone_cfg["source"]
    area = zone_cfg["area_sqm"]

    print(f"[{name}] Loading YOLO...")
    yolo_model = YOLO("yolov8n.pt")
    person_id = [k for k, v in yolo_model.names.items() if v == "person"][0]
    switcher = TierSwitcher()

    print(f"[{name}] Connecting to {source} ...")
    cap = cv2.VideoCapture(source)
    frame_num = 0
    prev_mode = switcher.mode

    while not stop_event.is_set():
        if not cap.isOpened():
            with state_lock:
                shared_state[name] = {"connected": False}
            time.sleep(2)
            cap = cv2.VideoCapture(source)  # keep retrying - one bad phone shouldn't kill the demo
            continue

        ret, frame = cap.read()
        if not ret:
            with state_lock:
                shared_state[name] = {"connected": False}
            cap.release()
            time.sleep(1)
            cap = cv2.VideoCapture(source)
            continue

        if frame_num % PROCESS_EVERY_N_FRAMES == 0:
            r = process_frame(frame, yolo_model, person_id, switcher, current_time=time.time(),
                               zone_area_sqm=area, csrnet_lock=csrnet_lock)
            mode_changed = r["mode"] != prev_mode
            prev_mode = r["mode"]
            img = draw_overlay(r, current_time=time.time() % 1000, mode_changed=mode_changed,
                                zone_name=name)
            img = resize_for_display(img, target_width=TILE_WIDTH)

            with state_lock:
                shared_state[name] = {"connected": True, "tile": img, "risk_label": r["risk_label"],
                                       "risk_score": r["risk_score"], "count": r["final_count"]}

            if mode_changed:
                print(f"[{name}] <<< MODE SWITCHED to {r['mode']}  "
                      f"(count={r['final_count']}, risk={r['risk_score']:.0f}% {r['risk_label']})")

        frame_num += 1

    cap.release()


def run_live(zones):
    stop_event = threading.Event()
    threads = []
    for zone_cfg in zones:
        t = threading.Thread(target=zone_worker_live, args=(zone_cfg, stop_event), daemon=True)
        t.start()
        threads.append(t)

    zone_names = [z["name"] for z in zones]
    window_name = "Visionix - Multi-Zone Monitor"
    cv2.namedWindow(window_name, cv2.WINDOW_NORMAL)

    print("\nStarting multi-zone display. Press 'q' in the window to quit.\n")

    try:
        while True:
            tiles = []
            with state_lock:
                for name in zone_names:
                    entry = shared_state.get(name)
                    if entry is None or not entry.get("connected", False):
                        placeholder = np.zeros((int(TILE_WIDTH * 9 / 16), TILE_WIDTH, 3), dtype=np.uint8)
                        cv2.putText(placeholder, f"{name}", (10, 30),
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
                        cv2.putText(placeholder, "connecting...", (10, 60),
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 165, 255), 2)
                        tiles.append(placeholder)
                    else:
                        tiles.append(entry["tile"])

            max_h = max(t.shape[0] for t in tiles)
            padded = [cv2.copyMakeBorder(t, 0, max_h - t.shape[0], 0, 0, cv2.BORDER_CONSTANT)
                      for t in tiles]
            combined = np.hstack(padded)
            cv2.imshow(window_name, combined)

            if cv2.waitKey(1) & 0xFF == ord("q"):
                break
            time.sleep(DISPLAY_REFRESH_SEC)
    finally:
        stop_event.set()
        for t in threads:
            t.join(timeout=3)
        cv2.destroyAllWindows()


# ---------------------------------------------------------------------------
def zone_worker_video(zone_cfg, csv_writer):
    name = zone_cfg["name"]
    source = zone_cfg["source"]
    area = zone_cfg["area_sqm"]

    source_path = source if os.path.isabs(source) else os.path.join(SCRIPT_DIR, source)
    if not os.path.exists(source_path):
        print(f"[{name}] ERROR: video not found: {source_path}")
        return

    print(f"[{name}] Loading YOLO...")
    yolo_model = YOLO("yolov8n.pt")
    person_id = [k for k, v in yolo_model.names.items() if v == "person"][0]
    switcher = TierSwitcher()

    cap = cv2.VideoCapture(source_path)
    fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    safe_name = "".join(c if c.isalnum() else "_" for c in name)
    out_path = os.path.join(OUTPUT_DIR, f"annotated_{safe_name}.mp4")
    out = cv2.VideoWriter(out_path, cv2.VideoWriter_fourcc(*"mp4v"), fps, (width, height))

    print(f"[{name}] Processing {source_path} ...")
    frame_num = 0
    prev_mode = switcher.mode

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        if frame_num % PROCESS_EVERY_N_FRAMES == 0:
            video_time_sec = frame_num / fps
            r = process_frame(frame, yolo_model, person_id, switcher, current_time=video_time_sec,
                               zone_area_sqm=area, csrnet_lock=csrnet_lock)
            mode_changed = r["mode"] != prev_mode
            prev_mode = r["mode"]
            img = draw_overlay(r, current_time=video_time_sec, mode_changed=mode_changed, zone_name=name)
            out.write(img)

            with csv_lock:
                csv_writer.writerow([name, frame_num, f"{video_time_sec:.2f}", r["yolo_count"],
                                     r["source"], r["final_count"], r["final_status"],
                                     r["risk_score"], r["risk_label"], r["mode"], mode_changed])

            if mode_changed:
                print(f"[{name}] t={video_time_sec:.1f}s  <<< SWITCH to {r['mode']}  "
                      f"(count={r['final_count']}, risk={r['risk_score']:.0f}% {r['risk_label']})")
        else:
            out.write(frame)

        frame_num += 1

    cap.release()
    out.release()
    print(f"[{name}] Done -> {out_path}")


def run_video(zones):
    import csv
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    log_path = os.path.join(OUTPUT_DIR, "multi_zone_log.csv")
    csv_file = open(log_path, "w", newline="")
    csv_writer = csv.writer(csv_file)
    csv_writer.writerow(["zone", "frame", "video_time_sec", "yolo_raw_count", "source",
                         "final_count", "status", "risk_score", "risk_label", "mode", "mode_changed"])

    threads = []
    for zone_cfg in zones:
        t = threading.Thread(target=zone_worker_video, args=(zone_cfg, csv_writer))
        t.start()
        threads.append(t)

    for t in threads:
        t.join()

    csv_file.close()
    print(f"\nAll zones done. Combined log: {log_path}")


# ---------------------------------------------------------------------------
def main():
    parser = argparse.ArgumentParser(description="Visionix multi-zone monitor")
    parser.add_argument("--mode", choices=["live", "video"], default="live")
    args = parser.parse_args()

    if args.mode == "live":
        run_live(LIVE_ZONES)
    else:
        run_video(VIDEO_ZONES)


if __name__ == "__main__":
    main()