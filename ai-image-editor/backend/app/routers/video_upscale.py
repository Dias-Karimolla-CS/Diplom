"""
Video upscaling router using PyTorch Real-ESRGAN on GPU.
Pipeline: ffmpeg extract frames → Real-ESRGAN (CUDA) upscale → ffmpeg re-encode.
"""
import os
import shutil
import subprocess
import tempfile
import logging
import json
from concurrent.futures import ThreadPoolExecutor
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
import asyncio
import numpy as np
import cv2
from PIL import Image

logger = logging.getLogger(__name__)

router = APIRouter()

MAX_FRAMES = 30000
MAX_WIDTH = 3840
MAX_HEIGHT = 2160

_executor = ThreadPoolExecutor(max_workers=1)

# Lazy-loaded video upscaler (realesr-animevideov3 — lightweight, fast, FP16-safe)
_video_upsampler = None


def _get_video_upsampler():
    global _video_upsampler
    if _video_upsampler is not None:
        return _video_upsampler

    import torch
    from realesrgan import RealESRGANer
    from basicsr.archs.srvgg_arch import SRVGGNetCompact

    device = "cuda" if torch.cuda.is_available() else "cpu"
    weights_path = os.path.join(
        os.environ.get("MODEL_DIR", "/app/models/weights"),
        "realesr-animevideov3.pth",
    )
    if not os.path.exists(weights_path):
        raise RuntimeError(f"Video model not found: {weights_path}")

    model = SRVGGNetCompact(
        num_in_ch=3, num_out_ch=3, num_feat=64,
        num_conv=16, upscale=4, act_type="prelu",
    )
    _video_upsampler = RealESRGANer(
        scale=4,
        model_path=weights_path,
        model=model,
        tile=384,
        tile_pad=10,
        pre_pad=0,
        half=(device == "cuda"),
        device=device,
    )
    logger.info("Video upsampler loaded on %s (half=%s)", device, device == "cuda")
    return _video_upsampler


def _get_video_info(input_path: str) -> dict:
    """Get video metadata via ffprobe."""
    cmd = [
        "ffprobe", "-v", "quiet",
        "-print_format", "json",
        "-show_streams", "-show_format",
        input_path,
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise ValueError(f"Cannot read video: {result.stderr[:200]}")

    data = json.loads(result.stdout)
    video_stream = None
    for s in data.get("streams", []):
        if s.get("codec_type") == "video":
            video_stream = s
            break

    if not video_stream:
        raise ValueError("No video stream found.")

    fps_parts = video_stream.get("r_frame_rate", "25/1").split("/")
    fps = float(fps_parts[0]) / float(fps_parts[1]) if len(fps_parts) == 2 else 25.0

    width = int(video_stream.get("width", 0))
    height = int(video_stream.get("height", 0))

    nb_frames = video_stream.get("nb_frames")
    if nb_frames and nb_frames != "N/A":
        frame_count = int(nb_frames)
    else:
        duration = float(data.get("format", {}).get("duration", 0))
        frame_count = int(duration * fps)

    has_audio = any(s.get("codec_type") == "audio" for s in data.get("streams", []))

    return {
        "fps": fps,
        "width": width,
        "height": height,
        "frame_count": frame_count,
        "has_audio": has_audio,
    }


def _run_cmd(cmd: list, desc: str, timeout: int = 3600):
    """Run a subprocess command, raise on failure."""
    logger.info("Running %s: %s", desc, " ".join(cmd))
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
    if result.returncode != 0:
        logger.error("%s failed (rc=%d): %s", desc, result.returncode, result.stderr[:500])
        raise RuntimeError(f"{desc} failed: {result.stderr[:300]}")
    return result


def _process_video(input_path: str, scale: int) -> str:
    """
    Upscale video using PyTorch Real-ESRGAN on GPU:
    1. Extract frames with ffmpeg
    2. Upscale each frame with Real-ESRGAN (CUDA)
    3. Re-encode with ffmpeg
    """
    work_dir = tempfile.mkdtemp(prefix="video_up_")
    frames_dir = os.path.join(work_dir, "frames")
    upscaled_dir = os.path.join(work_dir, "upscaled")
    os.makedirs(frames_dir)
    os.makedirs(upscaled_dir)
    audio_path = os.path.join(work_dir, "audio.aac")
    output_path = os.path.join(work_dir, "output.mp4")

    try:
        info = _get_video_info(input_path)
        fps = info["fps"]
        width = info["width"]
        height = info["height"]
        frame_count = info["frame_count"]
        has_audio = info["has_audio"]

        logger.info(
            "Video: %dx%d, %.2f fps, ~%d frames, audio=%s",
            width, height, fps, frame_count, has_audio,
        )

        if frame_count > MAX_FRAMES or width > MAX_WIDTH or height > MAX_HEIGHT:
            raise ValueError(
                f"Video too large. Max {MAX_FRAMES} frames at {MAX_WIDTH}x{MAX_HEIGHT}. "
                f"Got {frame_count} frames at {width}x{height}."
            )

        # Step 1: Extract frames
        _run_cmd([
            "ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
            "-i", input_path,
            "-qscale:v", "1", "-qmin", "1", "-qmax", "1",
            "-vsync", "0",
            os.path.join(frames_dir, "frame%08d.png"),
        ], "Frame extraction")

        # Extract audio if present
        if has_audio:
            audio_result = subprocess.run([
                "ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
                "-i", input_path,
                "-vn", "-acodec", "copy", audio_path,
            ], capture_output=True, text=True)
            if audio_result.returncode != 0:
                has_audio = False
                logger.warning("Audio extraction failed, proceeding without audio")

        frame_files = sorted([f for f in os.listdir(frames_dir) if f.endswith(".png")])
        logger.info("Extracted %d frames", len(frame_files))

        # Step 2: Upscale each frame with PyTorch Real-ESRGAN
        upsampler = _get_video_upsampler()
        for i, fname in enumerate(frame_files):
            frame_path = os.path.join(frames_dir, fname)
            img_bgr = cv2.imread(frame_path, cv2.IMREAD_UNCHANGED)
            output_bgr, _ = upsampler.enhance(img_bgr, outscale=scale)
            cv2.imwrite(os.path.join(upscaled_dir, fname), output_bgr)
            if (i + 1) % 50 == 0 or (i + 1) == len(frame_files):
                logger.info("Upscaled %d/%d frames", i + 1, len(frame_files))

        upscaled_count = len([f for f in os.listdir(upscaled_dir) if f.endswith(".png")])
        logger.info("Upscaled %d frames total", upscaled_count)

        # Step 3: Re-encode with ffmpeg
        encode_cmd = [
            "ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
            "-framerate", str(fps),
            "-i", os.path.join(upscaled_dir, "frame%08d.png"),
        ]
        if has_audio and os.path.exists(audio_path):
            encode_cmd += ["-i", audio_path, "-map", "0:v", "-map", "1:a", "-c:a", "copy"]

        encode_cmd += [
            "-c:v", "mpeg4", "-q:v", "3",
            "-pix_fmt", "yuv420p",
            "-movflags", "+faststart",
            output_path,
        ]
        _run_cmd(encode_cmd, "Video encoding")

        final_path = tempfile.NamedTemporaryFile(delete=False, suffix=".mp4", dir="/tmp").name
        shutil.move(output_path, final_path)

        logger.info("Video upscale complete: %d frames, output=%s", upscaled_count, final_path)
        return final_path

    finally:
        try:
            shutil.rmtree(work_dir)
        except OSError as e:
            logger.warning("Failed to clean up %s: %s", work_dir, e)


@router.post("/ai/video-upscale")
async def video_upscale(
    file: UploadFile = File(...),
    scale: int = Form(4),
):
    if scale not in (2, 3, 4):
        raise HTTPException(status_code=400, detail="Scale must be 2, 3, or 4.")

    suffix_in = os.path.splitext(file.filename or "video.mp4")[1] or ".mp4"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix_in, dir="/tmp") as tmp_in:
        tmp_in_path = tmp_in.name
        content = await file.read()
        tmp_in.write(content)

    try:
        loop = asyncio.get_event_loop()
        result_path = await loop.run_in_executor(
            _executor, _process_video, tmp_in_path, scale
        )

        return FileResponse(
            path=result_path,
            media_type="video/mp4",
            filename="upscaled_video.mp4",
            background=None,
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception as exc:
        logger.exception("Error during video upscaling: %s", exc)
        raise HTTPException(status_code=500, detail=f"Video upscaling failed: {exc}")
    finally:
        try:
            os.unlink(tmp_in_path)
        except OSError:
            pass
