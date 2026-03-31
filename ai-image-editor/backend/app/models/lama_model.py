"""
LaMa inpainting model wrapper.
"""


def load_lama(device: str = "cpu"):
    """
    Load a SimpleLama inpainting model.

    Args:
        device: 'cpu' or 'cuda'.

    Returns:
        SimpleLama instance (callable with PIL image + PIL mask).
    """
    from simple_lama_inpainting import SimpleLama

    return SimpleLama(device=device)
