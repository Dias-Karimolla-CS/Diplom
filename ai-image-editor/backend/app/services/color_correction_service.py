"""
Color / low-light correction service using Zero-DCE.
"""
from PIL import Image
from app.models.zero_dce import enhance as dce_enhance
from app.utils.image_io import pil_to_png_bytes


def correct_colors(model, pil_image: Image.Image, iterations: int = 8) -> bytes:
    """
    Enhance the colors / low-light conditions of *pil_image* using Zero-DCE.

    Args:
        model: Loaded DCENet model in eval mode.
        pil_image: Input PIL image.
        iterations: Number of curve iterations to apply (1-8).

    Returns:
        PNG bytes of the enhanced image.
    """
    result = dce_enhance(model, pil_image, iterations=iterations)
    return pil_to_png_bytes(result)
