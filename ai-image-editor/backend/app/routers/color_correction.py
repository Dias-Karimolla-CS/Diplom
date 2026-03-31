"""
Color correction router.
"""
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from fastapi.responses import Response

from app.dependencies import get_zero_dce
from app.services.color_correction_service import correct_colors
from app.utils.image_io import bytes_to_pil

router = APIRouter()


@router.post("/ai/color-correction")
async def color_correction_endpoint(
    image: UploadFile = File(...),
    iterations: int = 8,
    model=Depends(get_zero_dce),
):
    """
    Enhance image colors / low-light conditions.

    - **image**: Image file
    - **iterations**: Number of DCE curve iterations (1-16, default 8)

    Returns a PNG of the enhanced image.
    """
    if not (1 <= iterations <= 16):
        raise HTTPException(status_code=422, detail="iterations must be between 1 and 16.")

    # Clamp to model's supported range
    clamped_iterations = min(iterations, 8)

    raw = await image.read()
    pil_image = bytes_to_pil(raw)
    result_bytes = correct_colors(model, pil_image, iterations=clamped_iterations)
    return Response(content=result_bytes, media_type="image/png")
