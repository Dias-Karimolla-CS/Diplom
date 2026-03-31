FROM python:3.11-slim
WORKDIR /app
RUN apt-get update && apt-get install -y \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    libgl1 \
    git \
    && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
# Patch basicsr for torchvision>=0.16 compatibility (functional_tensor removed)
RUN python -c "import torchvision.transforms.functional as F" && \
    python -c "import torchvision.transforms.functional_tensor" 2>/dev/null || \
    python -c "import torchvision.transforms.functional as _f; import sys; \
import types; m=types.ModuleType('torchvision.transforms.functional_tensor'); \
m.__dict__.update({k:v for k,v in vars(_f).items()}); \
sys.modules['torchvision.transforms.functional_tensor']=m; \
import pathlib, torchvision; \
p=pathlib.Path(torchvision.__file__).parent/'transforms'/'functional_tensor.py'; \
p.write_text('from torchvision.transforms.functional import *\n')"
COPY app/ ./app/
RUN mkdir -p /app/models/weights
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
