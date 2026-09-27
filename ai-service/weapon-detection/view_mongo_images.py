import os
import base64
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()
mongo_uri = os.getenv("MONGO_URI")

client = MongoClient(mongo_uri)
db = client["weapon_detection"]
collection = db["detections"]

output_folder = "downloaded_screenshots"
os.makedirs(output_folder, exist_ok=True)

documents = collection.find()

count = 0
for doc in documents:
    detection_num = doc.get("detection_number", "unknown")
    class_name = doc.get("class_name", "unknown")
    date_str = doc.get("date", "unknown")
    image_base64 = doc.get("screenshot_base64")

    if image_base64:
        image_data = base64.b64decode(image_base64)
        filename = f"{output_folder}/detection_{detection_num}_{class_name}.jpg"
        with open(filename, "wb") as f:
            f.write(image_data)
        count += 1
        print(f"Saved: {filename}")

print(f"\nTotal {count} images downloaded to '{output_folder}' folder.")

client.close()
