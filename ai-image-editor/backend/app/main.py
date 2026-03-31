"""
FastAPI application entry point.
"""
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.models.model_registry import registry
from app.routers import health, background_removal, object_cutout, upscale, color_correction, video_upscale, inpaint, face_restore, packshot

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load all AI models at startup."""
    logger.info("Loading AI models...")
    registry.load_all(model_dir=settings.MODEL_DIR, device=settings.DEVICE)
    logger.info("Model loading complete.")
    yield
    logger.info("Shutting down.")


app = FastAPI(
    title="AI Image Editor API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers — all prefixed with /api/v1
PREFIX = "/api/v1"

app.include_router(health.router, prefix=PREFIX, tags=["health"])
app.include_router(background_removal.router, prefix=PREFIX, tags=["ai"])
app.include_router(object_cutout.router, prefix=PREFIX, tags=["ai"])
app.include_router(upscale.router, prefix=PREFIX, tags=["ai"])
app.include_router(color_correction.router, prefix=PREFIX, tags=["ai"])
app.include_router(video_upscale.router, prefix=PREFIX, tags=["ai"])
app.include_router(inpaint.router, prefix=PREFIX, tags=["ai"])
app.include_router(face_restore.router, prefix=PREFIX, tags=["ai"])
app.include_router(packshot.router, prefix=PREFIX, tags=["ai", "orchestration"])
