from fastapi import FastAPI
from fastapi.responses import StreamingResponse
import cv2
from ultralytics import YOLO

app = FastAPI()

model = YOLO("weapon-detection/weights/yolov8n.pt")

CAMERA_URL = "http://172.27.22.217:8080/video"


def generate_frames():
    cap = cv2.VideoCapture(CAMERA_URL)

    while True:
        ret, frame = cap.read()

        if not ret:
            continue

        results = model(frame, conf=0.5, verbose=False)
        annotated = results[0].plot()

        success, buffer = cv2.imencode(".jpg", annotated)

        if success:
            yield (
                b"--frame\r\n"
                b"Content-Type: image/jpeg\r\n\r\n"
                + buffer.tobytes()
                + b"\r\n"
            )


@app.get("/")
def home():
    return {"status": "Weapon API running"}


@app.get("/weapon/live")
def weapon_live():
    return StreamingResponse(
        generate_frames(),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )