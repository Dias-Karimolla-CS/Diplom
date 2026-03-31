import api from './api';

export async function cutoutObject(
  image: Blob,
  points: Array<[number, number]>,
  pointLabels: Array<number>
): Promise<Blob> {
  const formData = new FormData();
  formData.append('image', image, 'image.png');
  formData.append('points', JSON.stringify(points));
  formData.append('point_labels', JSON.stringify(pointLabels));

  const response = await api.post('/ai/object-cutout', formData, {
    responseType: 'blob',
  });

  return response.data as Blob;
}
