import api from './api';

export interface PackshotResponse {
  status: string;
  gates: Record<string, any>;
  warnings: string[];
  failed_reasons: string[];
  pipeline_log: string[];
  image_base64: string;
}

export async function generatePackshot(image: Blob, fastMode = false): Promise<PackshotResponse> {
  const formData = new FormData();
  formData.append('image', image, 'image.jpg');
  if (fastMode) {
    formData.append('fast_mode', 'true');
  }

  const response = await api.post('/ai/packshot', formData);
  return response.data as PackshotResponse;
}