from roboflow import Roboflow
from ultralytics import YOLO
from dotenv import load_dotenv
import os
import glob
import yaml
import torch

# ------------------------------------------------------------------
# EDIT THESE after you change your classes on Roboflow
# ------------------------------------------------------------------
NEW_DATASET_VERSION = 6          # <-- the NEW Roboflow version number (not 5)
RUN_NAME = "local_train_run5"    # <-- new name so old results are not mixed up
EPOCHS = 50
IMGSZ = 416
BATCH = 8
PATIENCE = 10
# ------------------------------------------------------------------


def main():
    load_dotenv()
    api_key = os.getenv("mLFKdvxIdsbPQ9EstJ4d")
    if not api_key:
        raise RuntimeError("Put ROBOFLOW_API_KEY=... in your .env file")

    # --- Step 0: Confirm GPU ---
    print("GPU available:", torch.cuda.is_available())
    print("GPU name:", torch.cuda.get_device_name(0) if torch.cuda.is_available() else "None")

    # --- Step 1: Download the NEW dataset version ---
    rf = Roboflow(api_key=api_key)
    project = rf.workspace("sneha-shakya").project("live-weapon-detector-coisa")
    version = project.version(NEW_DATASET_VERSION)
    dataset = version.download("yolov8")
    print("Downloaded to:", dataset.location)

    # --- Step 2: Show the classes so you can verify the change ---
    with open(f"{dataset.location}/data.yaml") as f:
        cfg = yaml.safe_load(f)
    print("Number of classes:", cfg["nc"])
    print("Class names (index = class id):")
    for i, name in enumerate(cfg["names"]):
        print(f"  {i}: {name}")

    # --- Step 3: Remove stale label caches ---
    for cache in glob.glob(f"{dataset.location}/**/*.cache", recursive=True):
        os.remove(cache)
        print("Removed old cache:", cache)

    # --- Step 4: Fix polygon-format labels (if any) ---
    def convert_polygon_to_bbox(values):
        cls = values[0]
        coords = list(map(float, values[1:]))
        xs, ys = coords[0::2], coords[1::2]
        xc, yc = (min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2
        w, h = max(xs) - min(xs), max(ys) - min(ys)
        return f"{cls} {xc} {yc} {w} {h}"

    fixed = 0
    for split in ["train", "valid", "test"]:
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
                with open(path, "w") as f:
                    f.write("\n".join(new_lines) + "\n")

    print(f"Fixed {fixed} polygon labels")

    # --- Step 5: Train from the PRETRAINED weights (not the old best.pt) ---
    model = YOLO("yolov8n.pt")

    results = model.train(
        data=f"{dataset.location}/data.yaml",
        epochs=EPOCHS,
        imgsz=IMGSZ,
        batch=BATCH,
        patience=PATIENCE,
        cache=False,
        workers=0,
        name=RUN_NAME,
    )

    print("Training complete. Best model at:", results.save_dir)


if __name__ == "__main__":
    main()