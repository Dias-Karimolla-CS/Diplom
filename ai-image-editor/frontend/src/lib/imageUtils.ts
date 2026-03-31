import { fabric } from 'fabric';

/**
 * Export a fabric.Object as a PNG Blob by rendering it onto a temporary canvas.
 * For fabric.Image objects, draws the element directly to avoid clone() stalling
 * on large data-URL sources.
 */
export async function fabricObjectToBlob(obj: fabric.Object): Promise<Blob> {
  // Fast path for images: draw _element directly, no clone needed
  if (obj.type === 'image') {
    const imgObj = obj as fabric.Image;
    const el = (imgObj as any)._element as HTMLImageElement | undefined;
    if (el) {
      const w = el.naturalWidth || el.width;
      const h = el.naturalHeight || el.height;
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get 2D context');
      ctx.drawImage(el, 0, 0, w, h);
      return new Promise((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('toBlob returned null'));
          },
          'image/png'
        );
      });
    }
  }

  // Fallback for non-image objects: clone with timeout
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('fabricObjectToBlob timed out'));
    }, 30000);

    const bound = obj.getBoundingRect(true);
    const w = Math.ceil(bound.width) || 1;
    const h = Math.ceil(bound.height) || 1;

    obj.clone((cloned: fabric.Object | null) => {
      clearTimeout(timeout);
      if (!cloned) {
        reject(new Error('Failed to clone object'));
        return;
      }

      const el = document.createElement('canvas');
      el.width = w;
      el.height = h;

      cloned.set({
        left: (cloned.left ?? 0) - bound.left,
        top: (cloned.top ?? 0) - bound.top,
      });
      cloned.setCoords();

      const staticCanvas = new fabric.StaticCanvas(el, { width: w, height: h });
      staticCanvas.add(cloned);
      staticCanvas.renderAll();

      staticCanvas.getElement().toBlob(
        (blob) => {
          staticCanvas.dispose();
          if (blob) resolve(blob);
          else reject(new Error('toBlob returned null'));
        },
        'image/png'
      );
    });
  });
}

/**
 * Load a Blob as a fabric.Image.
 * Converts to a data URL first so the blob URL can be safely revoked.
 */
export async function blobToFabricImage(blob: Blob): Promise<fabric.Image> {
  // Convert blob → data URL so Fabric doesn't hold a blob URL reference
  const dataURL = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

  return new Promise((resolve, reject) => {
    fabric.Image.fromURL(
      dataURL,
      (img) => {
        if (!img) {
          reject(new Error('Failed to load image from blob'));
          return;
        }
        resolve(img);
      },
      { crossOrigin: 'anonymous' }
    );
  });
}
