import cv2
from ultralytics import YOLO

# Model load karo
model = YOLO('runs/detect/local_train_run3/weights/best.pt')

# Video file ka path (apna path yaha daalo)
video_path = r"C:\Users\Sneha\Downloads\131937-751934672.mp4"

cap = cv2.VideoCapture(video_path)

if not cap.isOpened():
    raise RuntimeError("Video file nahi khul payi. Path check karo.")

cv2.namedWindow('Weapon Detection - Video Test', cv2.WINDOW_NORMAL)
cv2.resizeWindow('Weapon Detection - Video Test', 960, 540)

while True:
    ret, frame = cap.read()
    if not ret:
        print("Video khatam ho gayi")
        break

    results = model.predict(frame, conf=0.65, verbose=False)
    annotated = results[0].plot()

    cv2.imshow('Weapon Detection - Video Test', annotated)

    key = cv2.waitKey(1) & 0xFF
    if key == ord('q'):
        print("User ne rok diya")
        break

cap.release()
cv2.destroyAllWindows()