import { fabric } from 'fabric';

/**
 * Export the full canvas as a PNG and trigger a browser download.
 */
export function downloadCanvasAsPNG(
  canvas: fabric.Canvas,
  filename = 'export.png'
): void {
  const dataURL = canvas.toDataURL({ format: 'png', multiplier: 1 });
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataURL;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
