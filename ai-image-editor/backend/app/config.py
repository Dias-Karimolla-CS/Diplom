from pydantic_settings import BaseSettings
from pathlib import Path


class Settings(BaseSettings):
    MODEL_DIR: str = "/app/models/weights"
    DEVICE: str = "cpu"
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost"]
    MAX_INPUT_PIXELS: int = 2000 * 2000

    class Config:
        env_file = ".env"


settings = Settings()
