import os
from dotenv import load_dotenv
load_dotenv()
from roboflow import Roboflow
from ultralytics import YOLO
import os
import torch

def main():
    # --- Step 0: Confirm GPU ---
    print("GPU available:", torch.cuda.is_available())
    print("GPU name:", torch.cuda.get_device_name(0) if torch.cuda.is_available() else "None")

    # --- Step 1: Download dataset (v5 - with real clicked images) ---
    rf = Roboflow(api_key=os.getenv("ROBOFLOW_API_KEY"))
    project = rf.workspace("sneha-shakya").project("live-weapon-detector-coisa")
    version = project.version(5)
    dataset = version.download("yolov8")
    print("Downloaded to:", dataset.location)

    # --- Step 2: Fix polygon-format labels (if any) ---
    def convert_polygon_to_bbox(values):
        cls = values[0]
        coords = list(map(float, values[1:]))
        xs, ys = coords[0::2], coords[1::2]
        xc, yc = (min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2
        w, h = max(xs) - min(xs), max(ys) - min(ys)
        return f"{cls} {xc} {yc} {w} {h}"

    fixed = 0
    for split in ['train', 'valid', 'test']:
        label_dir = f"{dataset.location}/{split}/labels"
        if not os.path.exists(label_dir):
            continue
        for fname in os.listdir(label_dir):
            path = os.path.join(label_dir, fname)
            new_lines, changed = [], False
            with open(path) as f:
                for line in f:
                    v = line.split()
                    if len(v) == 5:
                        new_lines.append(line.strip())
                    elif len(v) > 5 and len(v) % 2 == 1:
                        new_lines.append(convert_polygon_to_bbox(v))
                        changed = True
                        fixed += 1
            if changed:
                with open(path, 'w') as f:
                    f.write('\n'.join(new_lines) + '\n')

    print(f"Fixed {fixed} polygon labels")

    # --- Step 3: Train (improved settings) ---
    model = YOLO('yolov8n.pt')

    results = model.train(
        data=f"{dataset.location}/data.yaml",
        epochs=25,
        imgsz=416,
        batch=8,
        patience=8,
        cache=False,
        workers=0,
        name='local_train_run4'
    )

    print("Training complete. Best model at:", results.save_dir)

if __name__ == "__main__":
    main()