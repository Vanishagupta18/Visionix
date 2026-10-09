import os, cv2, random

base = r"E:\SNEHA\live-weapon-detector-2\train"
names = ["blunt", "gun", "knife"]
SHOW_ONLY = 0  # 0 = blunt, 1 = gun, 2 = knife, None = sab

labels_dir = os.path.join(base, "labels")
files = os.listdir(labels_dir)
random.shuffle(files)
files = [f for f in files if not f.startswith(("000000","hammer","martelo","IcePick","BASEBALL_BAT"))]
for f in files:
    with open(os.path.join(labels_dir, f)) as file:
        lines = [l.split()[:5] for l in file if l.strip()]
    if SHOW_ONLY is not None and not any(int(l[0]) == SHOW_ONLY for l in lines):
        continue

    name = f.rsplit(".", 1)[0]
    img = None
    for ext in (".jpg", ".jpeg", ".png"):
        p = os.path.join(base, "images", name + ext)
        if os.path.exists(p):
            img = cv2.imread(p)
            break
    if img is None:
        continue

    h, w = img.shape[:2]
    for c, x, y, bw, bh in lines:
        x, y, bw, bh = float(x)*w, float(y)*h, float(bw)*w, float(bh)*h
        p1 = (int(x - bw/2), int(y - bh/2))
        p2 = (int(x + bw/2), int(y + bh/2))
        cv2.rectangle(img, p1, p2, (0, 255, 0), 2)
        cv2.putText(img, names[int(c)], (p1[0], p1[1]-5),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)

        print(name)
    img = cv2.resize(img, (640, 640))
    cv2.imshow("dataset (any key = next, q = quit)", img)
    cv2.imshow("dataset (any key = next, q = quit)", img)
    if cv2.waitKey(0) & 0xFF == ord("q"):
        break
cv2.destroyAllWindows()
