import sys
from PIL import Image

def process_image():
    src = r"C:\Users\berni\.gemini\antigravity\brain\76349a7c-84cf-4cf5-84d2-621e63e0ab8a\media__1780805813510.png"
    try:
        img = Image.open(src)
        width, height = img.size
        
        # Crop top 75%
        crop_height = int(height * 0.75)
        
        # Make it a square
        size = min(width, crop_height)
        start_x = max(0, (width - size) // 2)
        
        img_cropped = img.crop((start_x, 0, start_x + size, size))
        
        icon192 = img_cropped.resize((192, 192), Image.Resampling.LANCZOS)
        icon512 = img_cropped.resize((512, 512), Image.Resampling.LANCZOS)
        
        icon192.save(r"d:\ARHAT POS\apps\web\public\icons\icon-192x192.png")
        icon512.save(r"d:\ARHAT POS\apps\web\public\icons\icon-512x512.png")
        icon512.save(r"d:\ARHAT POS\apps\web\src\app\icon.png")
        
        print("Icons cropped and saved successfully")
    except Exception as e:
        print("Error:", e)
        sys.exit(1)

if __name__ == "__main__":
    process_image()
