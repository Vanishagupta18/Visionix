import cv2
import os
import base64
import winsound
from datetime import datetime
from ultralytics import YOLO
from pymongo import MongoClient
from dotenv import load_dotenv

# .env se MongoDB connection load karo
load_dotenv()
mongo_uri = os.getenv("MONGO_URI")

client = MongoClient(mongo_uri)
db = client["weapon_detection"]
collection = db["detections"]

model = YOLO(r'E:\SNEHA\runs\detect\runs\detect\local_train_run4-7\weights\best.pt')

cap = cv2.VideoCapture(0)

if not cap.isOpened():
    raise RuntimeError("Webcam nahi khul payi")

cv2.namedWindow('Live Weapon Detection', cv2.WINDOW_NORMAL)
cv2.resizeWindow('Live Weapon Detection', 960, 540)

CONSECUTIVE_FRAMES_REQUIRED = 5
detection_counter = 0
alert_triggered = False
detection_number = 0

months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

while True:
    ret, frame = cap.read()
    if not ret:
        print("Webcam se frame nahi mil raha")
        break

    results = model.predict(frame, conf=0.5, iou=0.3, verbose=False)
    boxes = results[0].boxes

    keep_indices = []
    for i, box in enumerate(boxes):
        cls_id = int(box.cls[0])
        conf = float(box.conf[0])

        if cls_id == 0 and conf < 0.8:
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

    if detection_counter >= CONSECUTIVE_FRAMES_REQUIRED and not alert_triggered:
        alert_triggered = True
        winsound.Beep(1000, 500)

        now = datetime.now()
        detection_number += 1

        date_str = f"{now.day:02d}-{months[now.month-1]}-{now.year}"
        time_str = now.strftime("%I:%M:%S %p")
        day_str = now.strftime("%A")

        # Image ko memory mein encode karo (JPEG bytes), phir base64 string banao
        success, buffer = cv2.imencode('.jpg', annotated)
        image_base64 = base64.b64encode(buffer).decode('utf-8')

        for box in filtered_boxes:
            conf = float(box.conf[0])
            cls_id = int(box.cls[0])
            cls_name = model.names[cls_id]

            document = {
                "detection_number": detection_number,
                "date": date_str,
                "time": time_str,
                "day": day_str,
                "class_name": cls_name,
                "confidence": round(conf, 2),
                "screenshot_base64": image_base64,
                "created_at": now
            }

            collection.insert_one(document)

        print(f"[ALERT #{detection_number}] Detected and saved to MongoDB -> {date_str} {time_str}")

    cv2.imshow('Live Weapon Detection', annotated)

    key = cv2.waitKey(1) & 0xFF
    if key == ord('q'):
        print("User ne rok diya")
        break

cap.release()
cv2.destroyAllWindows()
client.close()
