import cv2
import yt_dlp
from ultralytics import YOLO

# Model load karo
model = YOLO('runs/detect/local_train_run3/weights/best.pt')

# YouTube video ka link (apna link yaha daalo)
youtube_url = "https://www.youtube.com/watch?v=FidGPhNC4sc"

# YouTube se stream URL nikalna
ydl_opts = {'format': 'best[ext=mp4]'}
with yt_dlp.YoutubeDL(ydl_opts) as ydl:
    info = ydl.extract_info(youtube_url, download=False)
    stream_url = info['url']

cap = cv2.VideoCapture("https://www.youtube.com/watch?v=8L0hq7L1TPc")

if not cap.isOpened():
    raise RuntimeError("YouTube stream nahi khul paya. Link check karo ya internet connection dekho.")

cv2.namedWindow('Weapon Detection - YouTube Test', cv2.WINDOW_NORMAL)
cv2.resizeWindow('Weapon Detection - YouTube Test', 960, 540)

while True:
    ret, frame = cap.read()
    if not ret:
        print("Video khatam ho gayi ya stream disconnect ho gaya")
        break

    results = model.predict(frame, conf=0.65, verbose=False)
    annotated = results[0].plot()

    cv2.imshow('Weapon Detection - YouTube Test', annotated)

    key = cv2.waitKey(1) & 0xFF
    if key == ord('q'):
        print("User ne rok diya")
        break

cap.release()
cv2.destroyAllWindows()