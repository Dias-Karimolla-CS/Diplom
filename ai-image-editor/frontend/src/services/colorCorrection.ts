import api from './api';

export async function correctColors(image: Blob, iterations = 8): Promise<Blob> {
  const formData = new FormData();
  formData.append('image', image, 'image.png');
  formData.append('iterations', iterations.toString());

  const response = await api.post('/ai/color-correction', formData, {
    responseType: 'blob',
  });

  return response.data as Blob;
}
