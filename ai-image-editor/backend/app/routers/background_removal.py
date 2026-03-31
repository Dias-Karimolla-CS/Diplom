"""
Background removal router.
"""
from fastapi import APIRouter, UploadFile, File, Depends
from fastapi.responses import Response

from app.dependencies import get_u2net
from app.services.background_removal_service import remove_background
from app.utils.image_io import bytes_to_pil

router = APIRouter()


@router.post("/ai/background-removal")
async def background_removal_endpoint(
    image: UploadFile = File(...),
    threshold: float = 0.5,
    model=Depends(get_u2net),
):
    """
    Remove the background from the uploaded image.

    - **image**: Image file (JPEG, PNG, WEBP, etc.)
    - **threshold**: Mask binarisation threshold in [0, 1] (default 0.5)

    Returns a PNG image with transparent background.
    """
    raw = await image.read()
    pil_image = bytes_to_pil(raw)
    result_bytes = remove_background(model, pil_image, threshold=threshold)
    return Response(content=result_bytes, media_type="image/png")
