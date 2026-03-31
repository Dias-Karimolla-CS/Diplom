"""
Real-ESRGAN upscaling model wrapper.
"""
import os
import numpy as np
from PIL import Image


def load_esrgan(model_path: str, scale: int = 4, device: str = "cpu"):
    """
    Load a RealESRGANer instance from the given model path.

    Args:
        model_path: Path to the .pth weights file.
        scale: Upscaling factor (2 or 4).
        device: 'cpu' or 'cuda'.

    Returns:
        Configured RealESRGANer upsampler.
    """
    from basicsr.archs.rrdbnet_arch import RRDBNet
    from realesrgan import RealESRGANer

    model = RRDBNet(
        num_in_ch=3,
        num_out_ch=3,
        num_feat=64,
        num_block=23,
        num_grow_ch=32,
        scale=scale,
    )

    # FP16 causes NaN on GTX 16xx series with RealESRGAN_x4plus — use FP32 + tiling
    upsampler = RealESRGANer(
        scale=scale,
        model_path=model_path,
        model=model,
        tile=384,
        tile_pad=10,
        pre_pad=0,
        half=False,
        device=device,
    )
    return upsampler


def upscale(upsampler, pil_image: Image.Image, scale: int = 4) -> Image.Image:
    """
    Upscale a PIL image using Real-ESRGAN.

    Args:
        upsampler: Loaded RealESRGANer instance.
        pil_image: Input PIL image.
        scale: Upscaling factor.

    Returns:
        Upscaled PIL image.
    """
    import cv2

    # Convert PIL to BGR numpy array for Real-ESRGAN
    img_np = np.array(pil_image.convert("RGB"))
    img_bgr = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)

    output_bgr, _ = upsampler.enhance(img_bgr, outscale=scale)

    # Convert BGR back to RGB PIL
    output_rgb = cv2.cvtColor(output_bgr, cv2.COLOR_BGR2RGB)
    return Image.fromarray(output_rgb)
