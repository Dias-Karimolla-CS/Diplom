"""
Object cutout router (SAM-based point selection).
"""
import json
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from fastapi.responses import Response

from app.dependencies import get_sam
from app.services.object_cutout_service import cutout_object
from app.utils.image_io import bytes_to_pil

router = APIRouter()


@router.post("/ai/object-cutout")
async def object_cutout_endpoint(
    image: UploadFile = File(...),
    points: str = "[]",
    point_labels: str = "[]",
    predictor=Depends(get_sam),
):
    """
    Cut out an object from the image using SAM point prompts.

    - **image**: Image file
    - **points**: JSON string of [[x, y], ...] coordinates
    - **point_labels**: JSON string of [1, 0, ...] labels (1=foreground, 0=background)

    Returns a PNG image with the cutout object on transparent background.
    """
    try:
        parsed_points = json.loads(points)
        parsed_labels = json.loads(point_labels)
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=422, detail=f"Invalid JSON for points or point_labels: {exc}")

    if not parsed_points:
        raise HTTPException(status_code=422, detail="At least one point is required.")

    if len(parsed_points) != len(parsed_labels):
        raise HTTPException(status_code=422, detail="points and point_labels must have the same length.")

    raw = await image.read()
    pil_image = bytes_to_pil(raw)
    result_bytes = cutout_object(predictor, pil_image, parsed_points, parsed_labels)
    return Response(content=result_bytes, media_type="image/png")
