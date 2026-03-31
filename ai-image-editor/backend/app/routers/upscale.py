"""
Image upscaling router.
"""
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from fastapi.responses import Response

from app.config import settings
from app.dependencies import get_esrgan
from app.services.upscale_service import upscale_image
from app.utils.image_io import bytes_to_pil

router = APIRouter()


@router.post("/ai/upscale")
async def upscale_endpoint(
    image: UploadFile = File(...),
    scale: int = 4,
    upsampler=Depends(get_esrgan),
):
    """
    Upscale the uploaded image.

    - **image**: Image file
    - **scale**: Upscaling factor (2 or 4, default 4)

    Returns 413 if the input image exceeds MAX_INPUT_PIXELS.
    Returns a PNG of the upscaled image.
    """
    if scale not in (2, 4):
        raise HTTPException(status_code=422, detail="scale must be 2 or 4.")

    raw = await image.read()
    pil_image = bytes_to_pil(raw)

    width, height = pil_image.size
    if width * height > settings.MAX_INPUT_PIXELS:
        raise HTTPException(
            status_code=413,
            detail=f"Image is too large ({width}x{height} = {width * height} pixels). "
                   f"Maximum allowed is {settings.MAX_INPUT_PIXELS} pixels.",
        )

    result_bytes = upscale_image(upsampler, pil_image, scale=scale)
    return Response(content=result_bytes, media_type="image/png")
