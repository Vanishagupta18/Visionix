from ultralytics import YOLO

def main():
    model = YOLO('yolov8s.pt')

    model.train(
        data=r'E:\SNEHA\live-weapon-detector-2\data.yaml',
        epochs=80,
        imgsz=416,
        batch=8,
        workers=2,
        patience=20,
        project='runs/detect',
        name='local_train_run4',
        augment=True,
        hsv_h=0.015, hsv_s=0.7, hsv_v=0.4,
        flipud=0.5, fliplr=0.5,
        mosaic=1.0
    )

if __name__ == '__main__':
    main()
