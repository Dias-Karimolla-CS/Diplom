"""
Object cutout service using MobileSAM.
"""
import numpy as np
from PIL import Image
from typing import List

from app.models.sam_model import predict as sam_predict
from app.utils.image_io import pil_to_numpy_rgb, pil_to_png_bytes
from app.utils.mask_utils import feather_mask


def cutout_object(
    predictor,
    pil_image: Image.Image,
    points: List[List[float]],
    point_labels: List[int],
) -> bytes:
    """
    Cut out an object from *pil_image* using SAM point prompts.

    Args:
        predictor: Loaded SamPredictor instance.
        pil_image: Input PIL image.
        points: List of [x, y] prompt coordinates.
        point_labels: List of 1 (foreground) / 0 (background) per point.

    Returns:
        PNG bytes of an RGBA image with non-object pixels transparent.
    """
    np_rgb = pil_to_numpy_rgb(pil_image)

    # Get boolean mask from SAM
    bool_mask = sam_predict(predictor, np_rgb, points, point_labels)

    # Feather the mask edges for a smoother cutout
    soft_mask = feather_mask(bool_mask, radius=3)  # uint8 0-255

    # Build RGBA result
    rgba = pil_image.convert("RGBA")
    alpha_channel = Image.fromarray(soft_mask, mode="L")
    rgba.putalpha(alpha_channel)

    return pil_to_png_bytes(rgba)
