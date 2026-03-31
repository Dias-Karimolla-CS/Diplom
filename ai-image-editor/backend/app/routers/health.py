"""
Health check router.
"""
from fastapi import APIRouter
from app.models.model_registry import registry

router = APIRouter()


@router.get("/health")
def health_check():
    """Return service health and model load status."""
    return {
        "status": "ok",
        "models": {
            "u2net": registry.u2net_loaded,
            "esrgan": registry.esrgan_loaded,
            "zero_dce": registry.zero_dce_loaded,
            "sam": registry.sam_loaded,
        },
    }
