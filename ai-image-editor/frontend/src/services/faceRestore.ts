import api from './api';

export async function restoreFaces(
  image: Blob,
  weight: number = 0.5,
  upscale: number = 2
): Promise<Blob> {
  const formData = new FormData();
  formData.append('image', image, 'image.png');
  formData.append('weight', String(weight));
  formData.append('upscale', String(upscale));

  const response = await api.post('/ai/face-restore', formData, {
    responseType: 'blob',
  });

  return response.data as Blob;
}
