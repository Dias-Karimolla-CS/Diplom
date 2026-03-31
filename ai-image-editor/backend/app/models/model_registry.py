"""
Singleton model registry that manages all AI model instances.
"""
import os
import logging
from pathlib import Path

logger = logging.getLogger(__name__)


class ModelRegistry:
    """
    Singleton that holds all loaded AI models.
    Call load_all() once at application startup.
    """

    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        self._u2net = None
        self._esrgan = None
        self._zero_dce = None
        self._sam = None
        self._lama = None
        self._gfpgan = None
        self._u2net_loaded = False
        self._esrgan_loaded = False
        self._zero_dce_loaded = False
        self._sam_loaded = False
        self._lama_loaded = False
        self._gfpgan_loaded = False
        self._initialized = True

    # ------------------------------------------------------------------
    # Properties
    # ------------------------------------------------------------------

    @property
    def u2net(self):
        return self._u2net

    @property
    def esrgan(self):
        return self._esrgan

    @property
    def zero_dce(self):
        return self._zero_dce

    @property
    def sam(self):
        return self._sam

    @property
    def u2net_loaded(self) -> bool:
        return self._u2net_loaded

    @property
    def esrgan_loaded(self) -> bool:
        return self._esrgan_loaded

    @property
    def zero_dce_loaded(self) -> bool:
        return self._zero_dce_loaded

    @property
    def sam_loaded(self) -> bool:
        return self._sam_loaded

    @property
    def lama(self):
        return self._lama

    @property
    def lama_loaded(self) -> bool:
        return self._lama_loaded

    @property
    def gfpgan(self):
        return self._gfpgan

    @property
    def gfpgan_loaded(self) -> bool:
        return self._gfpgan_loaded

    # ------------------------------------------------------------------
    # Loading
    # ------------------------------------------------------------------

    def load_all(self, model_dir: str, device: str = "cpu") -> None:
        """
        Attempt to load all models from *model_dir*.
        Each model is loaded independently; failures are logged but do not
        prevent the application from starting.
        """
        model_path = Path(model_dir)
        logger.info(f"Loading models from {model_path} on device={device}")

        self._load_u2net(model_path, device)
        self._load_esrgan(model_path, device)
        self._load_zero_dce(model_path, device)
        self._load_sam(model_path, device)
        self._load_lama(model_path, device)
        self._load_gfpgan(model_path, device)

    def _load_u2net(self, model_path: Path, device: str) -> None:
        weights = model_path / "u2net.pth"
        if not weights.exists():
            weights = model_path / "u2netp.pth"
        if not weights.exists():
            logger.warning(f"U2Net weights not found at {model_path}. Background removal will be unavailable.")
            return
        import torch
        from app.models.u2net import U2NET, U2NETP
        state = torch.load(str(weights), map_location=device)
        # Detect architecture by checkpoint size: full U2NET has stage1 mid_ch=32, lite U2NETP has 16
        first_key = next(iter(state.keys()), "")
        is_full = state.get("stage1.rebnconv1.conv_s1.weight", None) is not None and \
                  state["stage1.rebnconv1.conv_s1.weight"].shape[0] == 32
        try:
            model = U2NET(in_ch=3, out_ch=1) if is_full else U2NETP(in_ch=3, out_ch=1)
            model.load_state_dict(state)
            model.to(device)
            model.eval()
            self._u2net = model
            self._u2net_loaded = True
            arch = "U2NET (full)" if is_full else "U2NETP (lite)"
            logger.info(f"U2Net loaded successfully ({arch}).")
        except Exception as exc:
            logger.error(f"Failed to load U2Net: {exc}")

    def _load_esrgan(self, model_path: Path, device: str) -> None:
        weights = model_path / "RealESRGAN_x4plus.pth"
        if not weights.exists():
            logger.warning(f"Real-ESRGAN weights not found at {weights}. Upscaling will be unavailable.")
            return
        try:
            from app.models.real_esrgan import load_esrgan
            self._esrgan = load_esrgan(str(weights), scale=4, device=device)
            self._esrgan_loaded = True
            logger.info("Real-ESRGAN loaded successfully.")
        except Exception as exc:
            logger.error(f"Failed to load Real-ESRGAN: {exc}")

    def _load_zero_dce(self, model_path: Path, device: str) -> None:
        weights = model_path / "zero_dce.pth"
        if not weights.exists():
            logger.warning(f"Zero-DCE weights not found at {weights}. Color correction will use fallback.")
            return
        try:
            import torch
            from app.models.zero_dce import DCENet
            model = DCENet()
            state = torch.load(str(weights), map_location=device)
            model.load_state_dict(state)
            model.to(device)
            model.eval()
            self._zero_dce = model
            self._zero_dce_loaded = True
            logger.info("Zero-DCE loaded successfully.")
        except Exception as exc:
            logger.error(f"Failed to load Zero-DCE: {exc}")

    def _load_sam(self, model_path: Path, device: str) -> None:
        weights = model_path / "mobile_sam.pt"
        if not weights.exists():
            logger.warning(f"MobileSAM weights not found at {weights}. Object cutout will be unavailable.")
            return
        try:
            from app.models.sam_model import load_sam
            self._sam = load_sam(str(weights), device=device)
            self._sam_loaded = True
            logger.info("MobileSAM loaded successfully.")
        except Exception as exc:
            logger.error(f"Failed to load MobileSAM: {exc}")

    def _load_gfpgan(self, model_path: Path, device: str) -> None:
        weights = model_path / "GFPGANv1.4.pth"
        if not weights.exists():
            logger.warning(f"GFPGAN weights not found at {weights}. Face restoration will be unavailable.")
            return
        try:
            from app.models.gfpgan_model import load_gfpgan
            # Use the existing ESRGAN as background upsampler if available
            bg_upsampler = self._esrgan if self._esrgan_loaded else None
            self._gfpgan = load_gfpgan(
                str(weights), upscale=2, device=device, bg_upsampler=bg_upsampler,
            )
            self._gfpgan_loaded = True
            logger.info("GFPGAN loaded successfully.")
        except Exception as exc:
            logger.error(f"Failed to load GFPGAN: {exc}")

    def _load_lama(self, model_path: Path, device: str) -> None:
        try:
            from app.models.lama_model import load_lama
            self._lama = load_lama(device=device)
            self._lama_loaded = True
            logger.info("LaMa loaded successfully.")
        except Exception as exc:
            logger.error(f"Failed to load LaMa: {exc}")


# Global singleton instance
registry = ModelRegistry()
