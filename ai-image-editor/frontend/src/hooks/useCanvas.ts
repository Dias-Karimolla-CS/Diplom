import { useRef, useCallback } from 'react';
import { fabric } from 'fabric';
import { blobToFabricImage, fabricObjectToBlob } from '@/lib/imageUtils';
import { addImageToCanvas } from '@/lib/fabricHelpers';
import { useEditorStore } from '@/store/editorStore';
import { Layer } from '@/types/editor.types';
import { generateId } from '@/lib/fabricHelpers';

export function useCanvas() {
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const { addLayer, removeLayer, setSelectedObjectId, setZoom } = useEditorStore();

  /** Add a blob image to the canvas as a new layer. */
  const addImageFromBlob = useCallback(
    async (blob: Blob, name = 'Image') => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const img = await blobToFabricImage(blob);
      const id = generateId();
      (img as fabric.Object & { layerId: string }).layerId = id;

      addImageToCanvas(canvas, img);

      const layer: Layer = {
        id,
        name,
        visible: true,
        locked: false,
        fabricObjectIndex: canvas.getObjects().length - 1,
      };
      addLayer(layer);
    },
    [addLayer]
  );

  /** Replace the active object's image with a new blob. */
  const replaceActiveObjectImage = useCallback(async (blob: Blob) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const active = canvas.getActiveObject() as fabric.Image | null;
    if (!active || active.type !== 'image') {
      throw new Error('No active image object selected');
    }

    const newImg = await blobToFabricImage(blob);

    // Preserve the current transform
    newImg.set({
      left: active.left,
      top: active.top,
      scaleX: active.scaleX,
      scaleY: active.scaleY,
      angle: active.angle,
      originX: active.originX,
      originY: active.originY,
    });

    // Copy custom properties
    const layerId = (active as fabric.Object & { layerId?: string }).layerId;
    if (layerId) {
      (newImg as fabric.Object & { layerId: string }).layerId = layerId;
    }

    canvas.remove(active);
    canvas.add(newImg);
    canvas.setActiveObject(newImg);
    canvas.renderAll();
  }, []);

  /** Export the active object as a PNG Blob. */
  const getActiveObjectAsBlob = useCallback(async (): Promise<Blob | null> => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const active = canvas.getActiveObject();
    if (!active) return null;

    return fabricObjectToBlob(active);
  }, []);

  /** Export the full canvas as a PNG Blob. */
  const getFullCanvasAsBlob = useCallback(async (): Promise<Blob | null> => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    return new Promise((resolve, reject) => {
      const dataURL = canvas.toDataURL({ format: 'png', multiplier: 1 });
      fetch(dataURL)
        .then((r) => r.blob())
        .then(resolve)
        .catch(reject);
    });
  }, []);

  /** Delete the currently selected object. */
  const deleteSelected = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const active = canvas.getActiveObject();
    if (!active) return;

    const layerId = (active as fabric.Object & { layerId?: string }).layerId;
    if (layerId) {
      removeLayer(layerId);
    }

    canvas.remove(active);
    canvas.discardActiveObject();
    canvas.renderAll();
    setSelectedObjectId(null);
  }, [removeLayer, setSelectedObjectId]);

  /** Set the canvas zoom level. */
  const setCanvasZoom = useCallback(
    (level: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const center = canvas.getCenter();
      canvas.zoomToPoint(new fabric.Point(center.left, center.top), level);
      setZoom(level);
    },
    [setZoom]
  );

  return {
    canvasRef,
    addImageFromBlob,
    replaceActiveObjectImage,
    getActiveObjectAsBlob,
    getFullCanvasAsBlob,
    deleteSelected,
    setCanvasZoom,
  };
}
