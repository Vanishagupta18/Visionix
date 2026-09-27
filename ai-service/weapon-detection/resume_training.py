from ultralytics import YOLO

def main():
    model = YOLO(r'E:\SNEHA\runs\detect\runs\detect\local_train_run4-7\weights\last.pt')
    model.train(resume=True)

if __name__ == '__main__':
    main()
