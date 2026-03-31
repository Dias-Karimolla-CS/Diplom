"""
AI Orchestration Service for bulk product photos (Packshot generation).
"""
import numpy as np
import cv2
import base64
from io import BytesIO
from PIL import Image

from app.models.u2net import predict as u2net_predict
from app.models.real_esrgan import upscale as esrgan_upscale
from app.models.zero_dce import enhance as dce_enhance

def analyze_image_properties(pil_image: Image.Image) -> dict:
    """Analyze the raw image to decide if enhancement steps are needed."""
    np_img = np.array(pil_image.convert('RGB'))
    gray = cv2.cvtColor(np_img, cv2.COLOR_RGB2GRAY)
    mean_brightness = float(np.mean(gray))
    h, w = gray.shape
    return {
        "mean_brightness": mean_brightness,
        "long_side": max(h, w),
        "width": w,
        "height": h,
        "np_rgb": np_img
    }

def post_process_mask(mask_255: np.ndarray) -> np.ndarray:
    """Refine U2Net mask to eliminate halos using morphology."""
    # 1. Erode by 3x3 to eat slightly into the boundary (halo mitigation)
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    eroded = cv2.erode(mask_255, kernel, iterations=1)
    
    # 2. Gaussian blur for structural anti-aliasing against pure white
    blurred = cv2.GaussianBlur(eroded, (3, 3), 1.0)
    
    # 3. Soft binarization to retain crisp edges while dropping transparent noise
    _, final_mask = cv2.threshold(blurred, 127, 255, cv2.THRESH_BINARY)
    return final_mask

def construct_qc_gates(original_np_rgb: np.ndarray, final_mask_np: np.ndarray, bbox: tuple) -> dict:
    """Evaluate pipeline quality based on strict gates to reduce false fails."""
    h, w = original_np_rgb.shape[:2]
    x, y, w_b, h_b = bbox
    
    gates = {}
    warnings = []
    failed_reasons = []
    
    # G1: Spatial Bounds (Cropped Source Check)
    if x <= 1 or y <= 1 or (x + w_b) >= w - 1 or (y + h_b) >= h - 1:
        failed_reasons.append("SOURCE_CROPPED")
        gates["G1_SPATIAL_BOUNDS"] = "FAILED: Object touches edge of source image"
    else:
        gates["G1_SPATIAL_BOUNDS"] = "PASSED"
        
    # G3: Halo Variance Test
    ring_kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
    dilated = cv2.dilate(final_mask_np, ring_kernel)
    ring = cv2.bitwise_xor(dilated, final_mask_np) 
    
    if np.sum(ring) > 0:
        gray_orig = cv2.cvtColor(original_np_rgb, cv2.COLOR_RGB2GRAY)
        ring_pixels = gray_orig[ring > 0]
        variance = float(np.var(ring_pixels))
        gates["G3_HALO_VARIANCE"] = round(variance, 2)
        if variance > 1500: # Threshold for high-contrast noisy edges
            warnings.append("HALO_DETECTED_OR_NOISY_BG")
    
    # G4: Integrity Check (Fragmented Object)
    contours, _ = cv2.findContours(final_mask_np, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    # Filter tiny noise components
    major_components = [c for c in contours if cv2.contourArea(c) > 500]
    num_components = len(major_components)
    gates["G4_INTEGRITY"] = f"Components: {num_components}"
    
    if num_components > 3:
        failed_reasons.append("FRAGMENTED_MASK")
        
    # Final Status Logic
    status = "PASSED"
    if failed_reasons:
        status = "FAILED_NEEDS_REVIEW"
    elif warnings:
        status = "PASSED_WITH_WARNINGS"
        
    return {
        "status": status,
        "gates": gates,
        "warnings": warnings,
        "failed_reasons": failed_reasons
    }

def generate_packshot(u2net_model, esrgan_model, dce_model, pil_image: Image.Image, fast_mode: bool = False) -> dict:
    """Orchestrates AI models to automatically build a marketplace-ready packshot."""
    pipeline_log = []
    target_res = 1920 if fast_mode else 2560
    
    # 1. Ingestion & Analysis
    pipeline_log.append("Started ingestion and analysis.")
    props = analyze_image_properties(pil_image)
    current_image = pil_image.convert('RGB')
    
    # 2. Conditional Exposure Correction
    if props["mean_brightness"] < 90 and dce_model is not None:
        pipeline_log.append(f"Zero-DCE applied (Mean luminance {props['mean_brightness']:.1f} < 90).")
        current_image = dce_enhance(dce_model, current_image, iterations=4)
        
    # 3. Conditional Resolution Enhancement
    # Note: Upscaling before U2Net provides a much higher resolution mask boundary.
    if props["long_side"] < 1200 and esrgan_model is not None:
        pipeline_log.append(f"Real-ESRGAN applied (Long edge {props['long_side']}px < 1200px).")
        scale = 2 if props["long_side"] > 600 else 4
        current_image = esrgan_upscale(esrgan_model, current_image, scale=scale)
        
    # 4. Semantic Segmentation
    pipeline_log.append("U2Net Semantic Segmentation running.")
    rgba_result = u2net_predict(u2net_model, current_image, threshold=0.85)
    
    # 5. Mask Post-Processing
    rgba_np = np.array(rgba_result)
    target_rgb = rgba_np[:, :, :3]
    raw_mask = rgba_np[:, :, 3]
    
    post_mask = post_process_mask(raw_mask)
    pipeline_log.append("OpenCV Morphology applied (erosion + blur) to mitigate halos.")
    
    # 6. Bounding Box & Centering Logic
    x, y, w, h = cv2.boundingRect(post_mask)
    if w == 0 or h == 0:
        return {
            "status": "FAILED_NEEDS_REVIEW",
            "failed_reasons": ["NO_OBJECT_DETECTED"],
            "pipeline_log": pipeline_log,
            "gates": {},
            "warnings": []
        }
        
    pipeline_log.append(f"Bounding box calculated: x:{x}, y:{y}, w:{w}, h:{h}")
    qc_results = construct_qc_gates(np.array(current_image), post_mask, (x, y, w, h))
    qc_results["pipeline_log"] = pipeline_log
    
    # 7. Geometry Compositing
    cropped_rgb = target_rgb[y:y+h, x:x+w]
    cropped_mask = post_mask[y:y+h, x:x+w]
    
    # 15% Safe Margin Scaling (meaning Object occupies 85% of Canvas)
    max_dim = max(w, h)
    scale_factor = (target_res * 0.85) / max_dim
    
    new_w = int(w * scale_factor)
    new_h = int(h * scale_factor)
    
    resized_rgb = cv2.resize(cropped_rgb, (new_w, new_h), interpolation=cv2.INTER_AREA)
    resized_mask = cv2.resize(cropped_mask, (new_w, new_h), interpolation=cv2.INTER_AREA)
    
    # Pure White Canvas
    canvas = np.ones((target_res, target_res, 3), dtype=np.uint8) * 255
    
    start_x = (target_res - new_w) // 2
    start_y = (target_res - new_h) // 2
    
    # Alpha compositing on pure white
    roi = canvas[start_y:start_y+new_h, start_x:start_x+new_w]
    mask_3d = resized_mask[:, :, None] / 255.0
    blended = (resized_rgb * mask_3d) + (roi * (1.0 - mask_3d))
    canvas[start_y:start_y+new_h, start_x:start_x+new_w] = blended.astype(np.uint8)
    pipeline_log.append(f"Result composited to perfect white canvas {target_res}x{target_res} with ~8% margins.")
    
    # 8. Encode payload
    final_pil = Image.fromarray(canvas)
    buffer = BytesIO()
    final_pil.save(buffer, format="PNG")
    b64_img = base64.b64encode(buffer.getvalue()).decode("utf-8")
    
    qc_results["image_base64"] = f"data:image/png;base64,{b64_img}"
    
    return qc_results
