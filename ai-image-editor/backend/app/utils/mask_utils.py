"""
Utility functions for mask post-processing.
"""
import numpy as np
import cv2


def feather_mask(mask: np.ndarray, radius: int = 3) -> np.ndarray:
    """
    Soften the edges of a binary/grayscale mask using Gaussian blur.

    Args:
        mask: Input mask as uint8 numpy array (0-255) or bool array.
        radius: Blur kernel radius (kernel size = 2*radius+1).

    Returns:
        Feathered mask as uint8 numpy array (0-255).
    """
    if mask.dtype == bool:
        mask = (mask.astype(np.uint8)) * 255

    mask_uint8 = mask.astype(np.uint8)
    kernel_size = 2 * radius + 1
    feathered = cv2.GaussianBlur(mask_uint8, (kernel_size, kernel_size), sigmaX=radius)
    return feathered
