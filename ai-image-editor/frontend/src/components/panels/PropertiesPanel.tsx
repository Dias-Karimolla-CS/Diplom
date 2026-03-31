'use client';

import { useEffect, useState, useCallback } from 'react';
import { fabric } from 'fabric';
import { useCanvasContext } from '@/components/editor/CanvasContext';
import { useEditorStore } from '@/store/editorStore';

interface ObjectProps {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
}

const defaultProps: ObjectProps = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  rotation: 0,
  opacity: 100,
};

export default function PropertiesPanel() {
  const { canvasRef } = useCanvasContext();
  const { selectedObjectId } = useEditorStore();
  const [props, setProps] = useState<ObjectProps>(defaultProps);

  const syncFromCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const obj = canvas.getActiveObject();
    if (!obj) {
      setProps(defaultProps);
      return;
    }
    setProps({
      x: Math.round(obj.left ?? 0),
      y: Math.round(obj.top ?? 0),
      width: Math.round((obj.width ?? 0) * (obj.scaleX ?? 1)),
      height: Math.round((obj.height ?? 0) * (obj.scaleY ?? 1)),
      rotation: Math.round(obj.angle ?? 0),
      opacity: Math.round((obj.opacity ?? 1) * 100),
    });
  }, [canvasRef]);

  useEffect(() => {
    syncFromCanvas();
  }, [selectedObjectId, syncFromCanvas]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.on('object:modified', syncFromCanvas);
    canvas.on('selection:updated', syncFromCanvas);
    return () => {
      canvas.off('object:modified', syncFromCanvas);
      canvas.off('selection:updated', syncFromCanvas);
    };
  }, [canvasRef, syncFromCanvas]);

  const updateProp = (key: keyof ObjectProps, value: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const obj = canvas.getActiveObject();
    if (!obj) return;

    setProps((prev) => ({ ...prev, [key]: value }));

    switch (key) {
      case 'x':
        obj.set({ left: value });
        break;
      case 'y':
        obj.set({ top: value });
        break;
      case 'width':
        obj.set({ scaleX: value / (obj.width ?? 1) });
        break;
      case 'height':
        obj.set({ scaleY: value / (obj.height ?? 1) });
        break;
      case 'rotation':
        obj.set({ angle: value });
        break;
      case 'opacity':
        obj.set({ opacity: value / 100 });
        break;
    }

    obj.setCoords();
    canvas.renderAll();
  };

  const hasSelection = selectedObjectId !== null;

  const Field = ({
    label,
    propKey,
    suffix = '',
  }: {
    label: string;
    propKey: keyof ObjectProps;
    suffix?: string;
  }) => (
    <div className="flex items-center gap-2">
      <label className="text-[11px] text-editor-text-dim w-8 flex-shrink-0 font-medium">{label}</label>
      <div className="relative flex-1">
        <input
          type="number"
          disabled={!hasSelection}
          value={props[propKey]}
          onChange={(e) => updateProp(propKey, Number(e.target.value))}
          className="input-field w-full py-1 text-xs disabled:opacity-30"
        />
        {suffix && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-editor-text-dim pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <h3 className="text-[11px] font-semibold text-editor-text-muted uppercase tracking-widest">
        Transform
      </h3>
      {!hasSelection && (
        <p className="text-xs text-editor-text-dim">
          Select an object to edit properties.
        </p>
      )}
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <Field label="X" propKey="x" suffix="px" />
          <Field label="Y" propKey="y" suffix="px" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Field label="W" propKey="width" suffix="px" />
          <Field label="H" propKey="height" suffix="px" />
        </div>
        <Field label="Rot" propKey="rotation" suffix="deg" />
        <Field label="Op" propKey="opacity" suffix="%" />
      </div>
    </div>
  );
}
