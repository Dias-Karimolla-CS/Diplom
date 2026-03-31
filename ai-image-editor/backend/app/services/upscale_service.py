"""
Image upscaling service using Real-ESRGAN.
"""
from PIL import Image
from app.models.real_esrgan import upscale as esrgan_upscale
from app.utils.image_io import pil_to_png_bytes


def upscale_image(upsampler, pil_image: Image.Image, scale: int = 4) -> bytes:
    """
    Upscale *pil_image* by *scale* factor using Real-ESRGAN.

    Args:
        upsampler: Loaded RealESRGANer instance.
        pil_image: Input PIL image.
        scale: Upscaling factor (2 or 4).

    Returns:
        PNG bytes of the upscaled image.
    """
    result = esrgan_upscale(upsampler, pil_image, scale=scale)
    return pil_to_png_bytes(result)
