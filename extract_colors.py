from PIL import Image
from collections import Counter

def get_dominant_colors(image_path, num_colors=10):
    image = Image.open(image_path)
    image = image.convert('RGB')
    # Resize to speed up processing
    image = image.resize((150, 150))
    
    pixels = list(image.getdata())
    color_counts = Counter(pixels)
    
    dominant_colors = color_counts.most_common(num_colors)
    
    print(f"Top {num_colors} Colors:")
    for color, count in dominant_colors:
        hex_color = '#{:02x}{:02x}{:02x}'.format(*color)
        print(f"{hex_color} (Count: {count})")

image_path = r"C:\Users\alisa\.gemini\antigravity\brain\806d71aa-eb22-482f-9aa4-5dd3fb317804\uploaded_media_1770451301430.jpg"
get_dominant_colors(image_path)
