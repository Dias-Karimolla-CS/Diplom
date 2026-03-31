"""
Object removal service: SAM mask -> dilate -> LaMa inpaint.
"""
import numpy as np
import cv2
from PIL import Image
from typing import List

from app.models.sam_model import predict as sam_predict
from app.utils.image_io import pil_to_numpy_rgb, pil_to_png_bytes


def inpaint_object(
    sam_predictor,
    lama_model,
    pil_image: Image.Image,
    points: List[List[float]],
    point_labels: List[int],
    dilate_kernel_size: int = 15,
) -> bytes:
    """
    Remove an object from *pil_image* using SAM segmentation + LaMa inpainting.

    Args:
        sam_predictor: Loaded SamPredictor instance.
        lama_model: Loaded SimpleLama instance.
        pil_image: Input PIL image.
        points: List of [x, y] prompt coordinates.
        point_labels: List of 1 (foreground) / 0 (background) per point.
        dilate_kernel_size: Kernel size for mask dilation (covers object edges).

    Returns:
        PNG bytes of the inpainted image with the object removed.
    """
    np_rgb = pil_to_numpy_rgb(pil_image)

    # 1. SAM mask (bool [H, W])
    bool_mask = sam_predict(sam_predictor, np_rgb, points, point_labels)

    # 2. Dilate mask to cover edges
    mask_uint8 = bool_mask.astype(np.uint8) * 255
    if dilate_kernel_size > 0:
        kernel = np.ones((dilate_kernel_size, dilate_kernel_size), np.uint8)
        mask_uint8 = cv2.dilate(mask_uint8, kernel, iterations=1)

    # 3. LaMa inpaint (expects PIL RGB image + PIL L mask, white = inpaint region)
    mask_pil = Image.fromarray(mask_uint8, mode="L")
    result = lama_model(pil_image.convert("RGB"), mask_pil)

    return pil_to_png_bytes(result)
