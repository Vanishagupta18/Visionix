from ultralytics import YOLO

model = YOLO('yolov8s.pt')

model.train(
    data=r'E:\SNEHA\live-weapon-detector-2\data.yaml',
    epochs=150,
    imgsz=640,
    batch=16,
    patience=30,
    project='runs/detect',
    name='local_train_run4',
    augment=True,
    hsv_h=0.015, hsv_s=0.7, hsv_v=0.4,
    flipud=0.5, fliplr=0.5,
    mosaic=1.0
)