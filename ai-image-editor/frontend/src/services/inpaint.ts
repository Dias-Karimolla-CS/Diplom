import api from './api';

export async function inpaintObject(
  image: Blob,
  points: Array<[number, number]>,
  pointLabels: Array<number>,
  dilateKernelSize: number = 15
): Promise<Blob> {
  const formData = new FormData();
  formData.append('image', image, 'image.png');
  formData.append('points', JSON.stringify(points));
  formData.append('point_labels', JSON.stringify(pointLabels));
  formData.append('dilate_kernel_size', String(dilateKernelSize));

  const response = await api.post('/ai/inpaint', formData, {
    responseType: 'blob',
  });

  return response.data as Blob;
}
