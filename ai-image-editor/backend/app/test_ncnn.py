import os, subprocess
from PIL import Image

os.makedirs("/tmp/test_in", exist_ok=True)
os.makedirs("/tmp/test_out", exist_ok=True)
Image.new("RGB", (64, 64), (255, 0, 0)).save("/tmp/test_in/test.png")

result = subprocess.run(
    ["realesrgan-ncnn-vulkan", "-i", "/tmp/test_in", "-o", "/tmp/test_out",
     "-n", "realesr-animevideov3", "-s", "4", "-v"],
    capture_output=True, text=True
)
print("rc:", result.returncode)
print("stdout:", result.stdout)
print("stderr:", result.stderr)
print("output files:", os.listdir("/tmp/test_out"))
