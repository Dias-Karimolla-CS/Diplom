"""
Zero-DCE (Zero-Reference Deep Curve Estimation) architecture implementation.
Reference: https://github.com/Li-Chongyi/Zero-DCE
"""
import torch
import torch.nn as nn
import numpy as np
from PIL import Image
import torchvision.transforms as transforms


class DCENet(nn.Module):
    """
    DCE-Net: 7 convolutional layers producing 24 output channels
    (8 curve maps x 3 RGB channels).

    Architecture:
      - 6 conv layers with ReLU activation, 64 channels
      - 1 final conv layer with Tanh, 24 channels
    """

    def __init__(self):
        super(DCENet, self).__init__()

        # Layers 1-7: input -> 64ch -> 64ch -> ... -> 24ch
        self.conv1 = nn.Conv2d(3, 64, 3, 1, 1)
        self.conv2 = nn.Conv2d(64, 64, 3, 1, 1)
        self.conv3 = nn.Conv2d(64, 64, 3, 1, 1)
        self.conv4 = nn.Conv2d(64, 64, 3, 1, 1)
        self.conv5 = nn.Conv2d(128, 64, 3, 1, 1)  # skip connection from conv3
        self.conv6 = nn.Conv2d(128, 64, 3, 1, 1)  # skip connection from conv2
        self.conv7 = nn.Conv2d(64, 24, 3, 1, 1)

        self.relu = nn.ReLU(inplace=True)
        self.tanh = nn.Tanh()

    def forward(self, x):
        x1 = self.relu(self.conv1(x))
        x2 = self.relu(self.conv2(x1))
        x3 = self.relu(self.conv3(x2))
        x4 = self.relu(self.conv4(x3))
        # Concatenate with skip connections (symmetric encoder-decoder style)
        x5 = self.relu(self.conv5(torch.cat([x4, x3], dim=1)))
        x6 = self.relu(self.conv6(torch.cat([x5, x2], dim=1)))
        x7 = self.tanh(self.conv7(x6))
        return x7  # [B, 24, H, W]


def enhance(model: nn.Module, pil_image: Image.Image, iterations: int = 8) -> Image.Image:
    """
    Apply DCE-Net enhancement to a PIL image.

    The network outputs 24 channels = 8 curve maps x 3 RGB channels.
    Each iteration applies the adjustment curve:
        I_out = I + A * (I - I^2)
    where A is the corresponding curve map for that iteration.

    Args:
        model: Loaded DCENet model (eval mode).
        pil_image: Input PIL image (RGB).
        iterations: Number of curve map iterations to apply (1-8).

    Returns:
        Enhanced PIL RGB image.
    """
    device = next(model.parameters()).device

    # Convert to RGB tensor [1, 3, H, W] in [0, 1]
    rgb = pil_image.convert("RGB")
    to_tensor = transforms.ToTensor()
    img_tensor = to_tensor(rgb).unsqueeze(0).to(device)  # [1, 3, H, W]

    with torch.no_grad():
        curve_maps = model(img_tensor)  # [1, 24, H, W]

    # curve_maps contains 8 sets of 3-channel curve maps
    # Apply iteratively: I = I + A*(I - I^2)
    enhanced = img_tensor.clone()
    for i in range(iterations):
        # Each iteration uses channels [i*3 : i*3+3]
        a = curve_maps[:, i * 3:(i + 1) * 3, :, :]  # [1, 3, H, W]
        enhanced = enhanced + a * (enhanced - enhanced ** 2)
        enhanced = enhanced.clamp(0, 1)

    # Convert back to PIL
    result_np = enhanced.squeeze(0).permute(1, 2, 0).cpu().numpy()
    result_np = (result_np * 255).clip(0, 255).astype(np.uint8)
    return Image.fromarray(result_np, mode="RGB")
