import api from './api';

export async function removeBackground(image: Blob, threshold = 0.5): Promise<Blob> {
  const formData = new FormData();
  formData.append('image', image, 'image.png');
  formData.append('threshold', threshold.toString());

  const response = await api.post('/ai/background-removal', formData, {
    responseType: 'blob',
  });

  return response.data as Blob;
}
