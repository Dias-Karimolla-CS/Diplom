"""
Object inpainting (removal) router.
"""
import json
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Form
from fastapi.responses import Response

from app.dependencies import get_sam, get_lama
from app.services.inpaint_service import inpaint_object
from app.utils.image_io import bytes_to_pil

router = APIRouter()


@router.post("/ai/inpaint")
async def inpaint_endpoint(
    image: UploadFile = File(...),
    points: str = Form("[]"),
    point_labels: str = Form("[]"),
    dilate_kernel_size: int = Form(15),
    sam_predictor=Depends(get_sam),
    lama_model=Depends(get_lama),
):
    """
    Remove an object from the image using SAM segmentation + LaMa inpainting.

    - **image**: Image file
    - **points**: JSON string of [[x, y], ...] coordinates
    - **point_labels**: JSON string of [1, 0, ...] labels (1=foreground, 0=background)
    - **dilate_kernel_size**: Mask dilation size (default 15, larger = more context removed)

    Returns a PNG image with the object removed.
    """
    try:
        parsed_points = json.loads(points)
        parsed_labels = json.loads(point_labels)
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=422, detail=f"Invalid JSON: {exc}")

    if not parsed_points:
        raise HTTPException(status_code=422, detail="At least one point is required.")

    if len(parsed_points) != len(parsed_labels):
        raise HTTPException(status_code=422, detail="points and point_labels must have the same length.")

    raw = await image.read()
    pil_image = bytes_to_pil(raw)
    result_bytes = inpaint_object(
        sam_predictor, lama_model, pil_image,
        parsed_points, parsed_labels, dilate_kernel_size,
    )
    return Response(content=result_bytes, media_type="image/png")
