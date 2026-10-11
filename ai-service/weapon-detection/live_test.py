import os
os.environ["OPENCV_FFMPEG_CAPTURE_OPTIONS"] = "timeout;5000000"
os.environ["OPENCV_LOG_LEVEL"] = "ERROR"
os.environ["OPENCV_FFMPEG_LOGLEVEL"] = "-8"

import cv2
import time
import base64
import winsound
from datetime import datetime
from ultralytics import YOLO
from pymongo import MongoClient
from dotenv import load_dotenv

# .env se MongoDB connection load karo
load_dotenv()
mongo_uri = os.getenv("MONGO_URI")

client = MongoClient(mongo_uri, serverSelectionTimeoutMS=30000)
db = client["weapon_detection"]
collection = db["detections"]

model = YOLO('models/best.pt')
print("Classes:", model.names)

URL = "http://192.168.31.168:8080/video"

def open_cam():
    c = cv2.VideoCapture(URL)
    c.set(cv2.CAP_PROP_BUFFERSIZE, 1)
    return c

cap = open_cam()

if not cap.isOpened():
    raise RuntimeError("Webcam nahi khul payi")

time.sleep(2)
for _ in range(30):
    cap.read()
fail_count = 0

cv2.namedWindow('Live Weapon Detection', cv2.WINDOW_NORMAL)
cv2.resizeWindow('Live Weapon Detection', 960, 540)

CONSECUTIVE_FRAMES_REQUIRED = 5
ALERT_GAP_SECONDS = 10
detection_counter = 0
alert_triggered = False
detection_number = 0
last_alert_time = 0

months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

while True:
    ret, frame = cap.read()
    if not ret:
        fail_count += 1
        if fail_count > 10:
            print("Stream atak gayi, reconnect kar raha hoon...")
            cap.release()
            time.sleep(2)
            cap = open_cam()
            fail_count = 0
        continue
    fail_count = 0

    results = model.predict(frame, conf=0.3, iou=0.3, verbose=False)
    boxes = results[0].boxes

    keep_indices = []
    for i, box in enumerate(boxes):
        cls_id = int(box.cls[0])
        conf = float(box.conf[0])

        if cls_id == 0 and conf < 0.5:
            continue
        elif cls_id == 1 and conf < 0.8:
            continue
        elif cls_id == 2 and conf < 0.65:
            continue

        keep_indices.append(i)

    filtered_boxes = boxes[keep_indices] if len(keep_indices) > 0 else boxes[[]]
    results[0].boxes = filtered_boxes
    annotated = results[0].plot()

    if len(filtered_boxes) > 0:
        detection_counter += 1
    else:
        detection_counter = 0
        alert_triggered = False

    if (detection_counter >= CONSECUTIVE_FRAMES_REQUIRED
            and not alert_triggered
            and time.time() - last_alert_time > ALERT_GAP_SECONDS):
        alert_triggered = True
        last_alert_time = time.time()
        winsound.Beep(1000, 500)

        now = datetime.now()
        detection_number += 1

        date_str = f"{now.day:02d}-{months[now.month-1]}-{now.year}"
        time_str = now.strftime("%I:%M:%S %p")
        day_str = now.strftime("%A")

        success, buffer = cv2.imencode('.jpg', annotated)
        image_base64 = base64.b64encode(buffer).decode('utf-8')

        detections_list = []
        for box in filtered_boxes:
            detections_list.append({
                "class_name": model.names[int(box.cls[0])],
                "confidence": round(float(box.conf[0]), 2),
                "bbox": [round(v, 1) for v in box.xyxy[0].tolist()]
            })

        document = {
            "detection_number": detection_number,
            "date": date_str,
            "time": time_str,
            "day": day_str,
            "total_objects": len(detections_list),
            "detections": detections_list,
            "max_confidence": max(d["confidence"] for d in detections_list),
            "screenshot_base64": image_base64,
            "created_at": now
        }

        try:
            collection.insert_one(document)
            print(f"[ALERT #{detection_number}] {len(detections_list)} object(s) saved to MongoDB -> {date_str} {time_str}")
        except Exception as e:
            print("MongoDB save failed:", e)

    cv2.imshow('Live Weapon Detection', annotated)

    key = cv2.waitKey(1) & 0xFF
    if key == ord('q'):
        print("User ne rok diya")
        break

cap.release()
cv2.destroyAllWindows()
client.close()

