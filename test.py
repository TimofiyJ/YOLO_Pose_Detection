import cv2
from ultralytics import YOLO

# Load the YOLO model
model = YOLO("yolo11s-pose.pt")

results = model(source=0,show=True,conf=0.8, save=True)