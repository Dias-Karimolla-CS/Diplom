import { fabric } from 'fabric';

/**
 * Initialise a fabric.Canvas with editor defaults.
 */
export function initCanvas(
  el: HTMLCanvasElement,
  width: number,
  height: number
): fabric.Canvas {
  return new fabric.Canvas(el, {
    width,
    height,
    backgroundColor: '#12121e',
    preserveObjectStacking: true,
    selection: true,
  });
}

/**
 * Centre an image on the canvas and set it as the active object.
 */
export function addImageToCanvas(canvas: fabric.Canvas, img: fabric.Image): void {
  const canvasWidth = canvas.getWidth();
  const canvasHeight = canvas.getHeight();

  // Scale down if the image is larger than the canvas
  const scale = Math.min(
    canvasWidth / (img.width || canvasWidth),
    canvasHeight / (img.height || canvasHeight),
    1
  );

  img.set({
    left: canvasWidth / 2,
    top: canvasHeight / 2,
    originX: 'center',
    originY: 'center',
    scaleX: scale,
    scaleY: scale,
  });

  canvas.add(img);
  canvas.setActiveObject(img);
  canvas.renderAll();
}

/**
 * Generate a unique ID for canvas objects / layers.
 */
export function generateId(): string {
  return `obj_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
