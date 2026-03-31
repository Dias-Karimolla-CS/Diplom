"""
Utility functions for image I/O conversions.
"""
import io
import numpy as np
from PIL import Image


def bytes_to_pil(data: bytes) -> Image.Image:
    """Convert raw bytes to a PIL Image."""
    return Image.open(io.BytesIO(data))


def pil_to_png_bytes(img: Image.Image) -> bytes:
    """Convert a PIL Image to PNG bytes."""
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)
    return buffer.read()


def pil_to_numpy_rgb(img: Image.Image) -> np.ndarray:
    """Convert a PIL Image to an [H, W, 3] uint8 numpy array in RGB."""
    return np.array(img.convert("RGB"), dtype=np.uint8)
