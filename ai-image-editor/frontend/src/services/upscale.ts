import api from './api';

export async function upscaleImage(image: Blob, scale = 4): Promise<Blob> {
  const formData = new FormData();
  formData.append('image', image, 'image.png');
  formData.append('scale', scale.toString());

  const response = await api.post('/ai/upscale', formData, {
    responseType: 'blob',
  });

  return response.data as Blob;
}
