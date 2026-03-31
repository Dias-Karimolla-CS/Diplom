"""
Batch operations and orchestration router.
"""
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException

from app.dependencies import get_u2net, get_esrgan, get_zero_dce
from app.services.orchestration_service import generate_packshot
from app.utils.image_io import bytes_to_pil

router = APIRouter()


@router.post("/ai/packshot")
async def create_packshot_endpoint(
    image: UploadFile = File(...),
    fast_mode: bool = Form(False),
    u2net=Depends(get_u2net),
    esrgan=Depends(get_esrgan),
    zero_dce=Depends(get_zero_dce),
):
    """
    Fully automated pipeline to create a marketplace-ready packshot.
    - Diagnoses and fixes exposure.
    - Diagnoses and upscales resolution / removes JPG noise.
    - Removes background entirely and mathematically centers the product.
    - Evaluates final quality through QC Gates.

    Returns a JSON containing qc_metrics, pipeline array, and Base64 PNG.
    """
    raw = await image.read()
    pil_image = bytes_to_pil(raw)
    
    # Run the orchestrator
    result = generate_packshot(
        u2net_model=u2net, 
        esrgan_model=esrgan, 
        dce_model=zero_dce, 
        pil_image=pil_image, 
        fast_mode=fast_mode
    )
    
    return result
