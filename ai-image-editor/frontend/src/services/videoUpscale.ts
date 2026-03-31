import api from './api';

export async function uploadVideoForUpscale(
  file: File,
  scale: number,
  onProgress: (pct: number) => void,
): Promise<Blob> {
  const formData = new FormData();
  formData.append('file', file, file.name);
  formData.append('scale', scale.toString());

  const response = await api.post('/ai/video-upscale', formData, {
    responseType: 'blob',
    onUploadProgress: (event) => {
      if (event.total) {
        const pct = Math.round((event.loaded * 100) / event.total);
        onProgress(pct);
      }
    },
  });

  return response.data as Blob;
}
