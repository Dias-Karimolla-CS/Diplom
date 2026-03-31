"""
FastAPI dependency injection helpers.
"""
from fastapi import HTTPException
from app.models.model_registry import registry


def get_u2net():
    if not registry.u2net_loaded:
        raise HTTPException(status_code=503, detail="U2Net model not loaded. Please ensure weights are available.")
    return registry.u2net


def get_esrgan():
    if not registry.esrgan_loaded:
        raise HTTPException(status_code=503, detail="Real-ESRGAN model not loaded. Please ensure weights are available.")
    return registry.esrgan


def get_zero_dce():
    if not registry.zero_dce_loaded:
        raise HTTPException(status_code=503, detail="Zero-DCE model not loaded. Please ensure weights are available.")
    return registry.zero_dce


def get_sam():
    if not registry.sam_loaded:
        raise HTTPException(status_code=503, detail="MobileSAM model not loaded. Please ensure weights are available.")
    return registry.sam


def get_gfpgan():
    if not registry.gfpgan_loaded:
        raise HTTPException(status_code=503, detail="GFPGAN model not loaded. Please ensure GFPGANv1.4.pth is available.")
    return registry.gfpgan


def get_lama():
    if not registry.lama_loaded:
        raise HTTPException(status_code=503, detail="LaMa model not loaded. Please ensure the package is installed.")
    return registry.lama
