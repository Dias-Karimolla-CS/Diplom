#!/bin/bash
set -e

MODELS_DIR="${1:-./models}"
mkdir -p "$MODELS_DIR"

echo "Downloading U2Net lite (u2netp.pth)..."
wget -q --show-progress -O "$MODELS_DIR/u2netp.pth" \
    "https://github.com/xuebinqin/U-2-Net/releases/download/u2netp/u2netp.pth"

echo "Downloading Real-ESRGAN x4plus (RealESRGAN_x4plus.pth)..."
wget -q --show-progress -O "$MODELS_DIR/RealESRGAN_x4plus.pth" \
    "https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth"

echo "Downloading MobileSAM (mobile_sam.pt)..."
wget -q --show-progress -O "$MODELS_DIR/mobile_sam.pt" \
    "https://github.com/ChaoningZhang/MobileSAM/raw/master/weights/mobile_sam.pt"

echo ""
echo "NOTE: Zero-DCE weights (zero_dce.pth) must be trained or obtained separately."
echo "Place zero_dce.pth in $MODELS_DIR/"
echo ""
echo "Done. Models saved to $MODELS_DIR/"
