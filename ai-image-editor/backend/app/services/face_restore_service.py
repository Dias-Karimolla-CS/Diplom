"""
Face restoration service using GFPGAN.
"""
import numpy as np
import cv2
from PIL import Image

from app.utils.image_io import pil_to_png_bytes


def restore_faces(
    gfpgan_model,
    pil_image: Image.Image,
    weight: float = 0.5,
    upscale: int = 2,
) -> bytes:
    """
    Restore and enhance faces in the image using GFPGAN.

    Args:
        gfpgan_model: Loaded GFPGANer instance.
        pil_image: Input PIL image.
        weight: Enhancement strength (0.0 = no enhancement, 1.0 = full).
        upscale: Upscaling factor for the output.

    Returns:
        PNG bytes of the restored image.
    """
    # Convert PIL RGB to BGR numpy for GFPGAN
    img_rgb = np.array(pil_image.convert("RGB"))
    img_bgr = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2BGR)

    # Update upscale factor on the model
    gfpgan_model.upscale = upscale

    # Enhance: returns (cropped_faces, restored_faces, restored_img)
    _, _, restored_bgr = gfpgan_model.enhance(
        img_bgr,
        has_aligned=False,
        only_center_face=False,
        paste_back=True,
        weight=weight,
    )

    # Convert back to RGB PIL
    restored_rgb = cv2.cvtColor(restored_bgr, cv2.COLOR_BGR2RGB)
    result = Image.fromarray(restored_rgb)

    return pil_to_png_bytes(result)
