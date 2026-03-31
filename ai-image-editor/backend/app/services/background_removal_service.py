"""
Background removal service using U2Net.
"""
from PIL import Image
from app.models.u2net import predict as u2net_predict
from app.utils.image_io import pil_to_png_bytes


def remove_background(model, pil_image: Image.Image, threshold: float = 0.5) -> bytes:
    """
    Remove the background from *pil_image* using the provided U2Net model.

    Args:
        model: Loaded U2Net/U2NETP model in eval mode.
        pil_image: Input PIL image.
        threshold: Mask binarisation threshold (0-1).

    Returns:
        PNG bytes of the RGBA result image with background removed.
    """
    result = u2net_predict(model, pil_image, threshold=threshold)
    return pil_to_png_bytes(result)
