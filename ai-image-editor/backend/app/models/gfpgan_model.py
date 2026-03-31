"""
GFPGAN face restoration model wrapper.
"""


def load_gfpgan(model_path: str, upscale: int = 2, device: str = "cpu", bg_upsampler=None):
    """
    Load a GFPGANer instance.

    Args:
        model_path: Path to GFPGANv1.4.pth weights.
        upscale: Upscaling factor for the final output.
        device: 'cpu' or 'cuda'.
        bg_upsampler: Optional Real-ESRGAN upsampler for background enhancement.

    Returns:
        Configured GFPGANer instance.
    """
    from gfpgan import GFPGANer

    return GFPGANer(
        model_path=model_path,
        upscale=upscale,
        arch="clean",
        channel_multiplier=2,
        bg_upsampler=bg_upsampler,
        device=device,
    )
