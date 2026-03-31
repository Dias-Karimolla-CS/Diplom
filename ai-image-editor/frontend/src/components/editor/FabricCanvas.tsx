'use client';

import { useEffect, useRef, useCallback } from 'react';
import { fabric } from 'fabric';
import { useEditorStore } from '@/store/editorStore';
import { useCanvasContext } from './CanvasContext';
import { initCanvas } from '@/lib/fabricHelpers';
import { Tool } from '@/types/editor.types';

export default function FabricCanvas() {
  const htmlCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isPanning = useRef(false);
  const lastPanPoint = useRef<{ x: number; y: number } | null>(null);
  const spacePressed = useRef(false);

  const { canvasRef, pushHistory } = useCanvasContext();
  const {
    activeTool,
    setSelectedObjectId,
    setZoom,
    addSamPoint,
  } = useEditorStore();

  // Initialise fabric canvas
  useEffect(() => {
    if (!htmlCanvasRef.current) return;

    const container = containerRef.current;
    const width = container?.clientWidth || 800;
    const height = container?.clientHeight || 600;

    const canvas = initCanvas(htmlCanvasRef.current, width, height);
    canvasRef.current = canvas;

    // Push initial empty state to history
    pushHistory(canvas);

    // Cleanup
    return () => {
      canvas.dispose();
      canvasRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle canvas resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.setWidth(container.clientWidth);
      canvas.setHeight(container.clientHeight);
      canvas.renderAll();
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [canvasRef]);

  // Sync active object selection
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onSelected = (e: fabric.IEvent) => {
      const target = e.target as fabric.Object & { layerId?: string };
      setSelectedObjectId(target?.layerId ?? null);
    };

    const onCleared = () => setSelectedObjectId(null);

    canvas.on('selection:created', onSelected);
    canvas.on('selection:updated', onSelected);
    canvas.on('selection:cleared', onCleared);

    return () => {
      canvas.off('selection:created', onSelected);
      canvas.off('selection:updated', onSelected);
      canvas.off('selection:cleared', onCleared);
    };
  }, [canvasRef, setSelectedObjectId]);

  // Record history after modifications
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onModified = () => pushHistory(canvas);
    canvas.on('object:modified', onModified);
    canvas.on('object:added', onModified);
    canvas.on('object:removed', onModified);

    return () => {
      canvas.off('object:modified', onModified);
      canvas.off('object:added', onModified);
      canvas.off('object:removed', onModified);
    };
  }, [canvasRef, pushHistory]);

  // Mouse down — SAM point collection in MAGIC_SELECT mode
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onMouseDown = (e: fabric.IEvent<MouseEvent>) => {
      if (activeTool !== Tool.MAGIC_SELECT) return;
      const pointer = canvas.getPointer(e.e);
      // Left click = foreground (label 1), right click = background (label 0)
      const label = e.e.button === 2 ? 0 : 1;
      addSamPoint({ x: pointer.x, y: pointer.y, label });
    };

    canvas.on('mouse:down', onMouseDown);
    return () => canvas.off('mouse:down', onMouseDown);
  }, [canvasRef, activeTool, addSamPoint]);

  // Zoom with mouse wheel
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onWheel = (e: fabric.IEvent<WheelEvent>) => {
      e.e.preventDefault();
      const delta = e.e.deltaY;
      let zoom = canvas.getZoom();
      zoom *= 0.999 ** delta;
      zoom = Math.max(0.1, Math.min(zoom, 20));

      canvas.zoomToPoint(new fabric.Point(e.e.offsetX, e.e.offsetY), zoom);
      setZoom(zoom);
    };

    canvas.on('mouse:wheel', onWheel);
    return () => canvas.off('mouse:wheel', onWheel);
  }, [canvasRef, setZoom]);

  // Spacebar pan handling
  const onKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Space') {
      spacePressed.current = true;
      const canvas = canvasRef.current;
      if (canvas) canvas.defaultCursor = 'grab';
    }
  }, [canvasRef]);

  const onKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Space') {
      spacePressed.current = false;
      isPanning.current = false;
      lastPanPoint.current = null;
      const canvas = canvasRef.current;
      if (canvas) canvas.defaultCursor = 'default';
    }
  }, [canvasRef]);

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [onKeyDown, onKeyUp]);

  // Pan with spacebar + drag
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onMouseDownPan = (e: fabric.IEvent<MouseEvent>) => {
      if (!spacePressed.current) return;
      isPanning.current = true;
      lastPanPoint.current = { x: e.e.clientX, y: e.e.clientY };
      canvas.defaultCursor = 'grabbing';
    };

    const onMouseMovePan = (e: fabric.IEvent<MouseEvent>) => {
      if (!isPanning.current || !lastPanPoint.current) return;
      const dx = e.e.clientX - lastPanPoint.current.x;
      const dy = e.e.clientY - lastPanPoint.current.y;
      const vpt = canvas.viewportTransform;
      if (vpt) {
        vpt[4] += dx;
        vpt[5] += dy;
        canvas.requestRenderAll();
      }
      lastPanPoint.current = { x: e.e.clientX, y: e.e.clientY };
    };

    const onMouseUpPan = () => {
      if (isPanning.current) {
        isPanning.current = false;
        lastPanPoint.current = null;
        canvas.defaultCursor = spacePressed.current ? 'grab' : 'default';
      }
    };

    canvas.on('mouse:down', onMouseDownPan);
    canvas.on('mouse:move', onMouseMovePan);
    canvas.on('mouse:up', onMouseUpPan);

    return () => {
      canvas.off('mouse:down', onMouseDownPan);
      canvas.off('mouse:move', onMouseMovePan);
      canvas.off('mouse:up', onMouseUpPan);
    };
  }, [canvasRef]);

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden">
      <canvas ref={htmlCanvasRef} />
    </div>
  );
}
