export interface BackgroundRemovalRequest {
  image: File | Blob;
  threshold?: number;
}

export interface ObjectCutoutRequest {
  image: File | Blob;
  points: Array<[number, number]>;
  pointLabels: Array<number>;
}

export interface UpscaleRequest {
  image: File | Blob;
  scale?: number;
}

export interface ColorCorrectionRequest {
  image: File | Blob;
  iterations?: number;
}

export interface APIError {
  detail: string;
  code: string;
}
