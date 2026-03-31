"""
Face restoration router using GFPGAN.
"""
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Form
from fastapi.responses import Response

from app.dependencies import get_gfpgan
from app.services.face_restore_service import restore_faces
from app.utils.image_io import bytes_to_pil

router = APIRouter()


@router.post("/ai/face-restore")
async def face_restore_endpoint(
    image: UploadFile = File(...),
    weight: float = Form(0.5),
    upscale: int = Form(2),
    gfpgan_model=Depends(get_gfpgan),
):
    """
    Restore and enhance faces in the image using GFPGAN.

    - **image**: Image file containing faces
    - **weight**: Enhancement strength (0.0-1.0, default 0.5)
    - **upscale**: Output upscaling factor (1, 2, or 4, default 2)

    Returns a PNG image with restored faces.
    """
    if not (0.0 <= weight <= 1.0):
        raise HTTPException(status_code=422, detail="Weight must be between 0.0 and 1.0.")
    if upscale not in (1, 2, 4):
        raise HTTPException(status_code=422, detail="Upscale must be 1, 2, or 4.")

    raw = await image.read()
    pil_image = bytes_to_pil(raw)
    result_bytes = restore_faces(gfpgan_model, pil_image, weight=weight, upscale=upscale)
    return Response(content=result_bytes, media_type="image/png")
