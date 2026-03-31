"""
MobileSAM (Segment Anything Model - Mobile version) wrapper.
"""
import numpy as np
from PIL import Image
from typing import List, Tuple


def load_sam(model_path: str, device: str = "cpu"):
    """
    Load MobileSAM model and return a SamPredictor.

    Args:
        model_path: Path to mobile_sam.pt weights file.
        device: 'cpu' or 'cuda'.

    Returns:
        SamPredictor instance.
    """
    from mobile_sam import sam_model_registry, SamPredictor

    sam = sam_model_registry["vit_t"](checkpoint=model_path)
    sam.to(device=device)
    sam.eval()
    predictor = SamPredictor(sam)
    return predictor


def predict(
    predictor,
    np_rgb: np.ndarray,
    points: List[List[float]],
    labels: List[int],
) -> np.ndarray:
    """
    Run SAM prediction given an RGB image and point prompts.

    Args:
        predictor: SamPredictor instance (from load_sam).
        np_rgb: Input image as [H, W, 3] uint8 numpy array in RGB.
        points: List of [x, y] point coordinates.
        labels: List of 1 (foreground) or 0 (background) labels for each point.

    Returns:
        Boolean mask array of shape [H, W].
    """
    predictor.set_image(np_rgb)

    point_coords = np.array(points, dtype=np.float32)  # [N, 2]
    point_labels = np.array(labels, dtype=np.int32)     # [N]

    masks, scores, logits = predictor.predict(
        point_coords=point_coords,
        point_labels=point_labels,
        multimask_output=True,
    )

    # Choose the mask with highest confidence score
    best_idx = int(np.argmax(scores))
    return masks[best_idx].astype(bool)
