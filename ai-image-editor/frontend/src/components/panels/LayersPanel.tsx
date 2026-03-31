'use client';

import { useCallback } from 'react';
import { Eye, EyeOff, Lock, Unlock, GripVertical, ImageIcon } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useEditorStore } from '@/store/editorStore';
import { useCanvasContext } from '@/components/editor/CanvasContext';
import { Layer } from '@/types/editor.types';

interface SortableLayerProps {
  layer: Layer;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onToggleVisible: (id: string) => void;
  onToggleLocked: (id: string) => void;
}

function SortableLayer({
  layer,
  isSelected,
  onSelect,
  onToggleVisible,
  onToggleLocked,
}: SortableLayerProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: layer.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onSelect(layer.id)}
      className={`
        flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer select-none
        transition-all duration-150
        ${isSelected
          ? 'bg-editor-accent/10 border border-editor-accent/25'
          : 'border border-transparent hover:bg-white/[0.03]'
        }
      `}
    >
      <button
        {...attributes}
        {...listeners}
        className="text-editor-text-dim hover:text-editor-text-muted cursor-grab active:cursor-grabbing transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical size={13} />
      </button>

      {/* Layer thumbnail placeholder */}
      <div className="w-7 h-7 rounded bg-white/[0.04] border border-white/[0.06] flex items-center justify-center flex-shrink-0">
        <ImageIcon size={12} className="text-editor-text-dim" />
      </div>

      <span className="flex-1 text-xs truncate font-medium">{layer.name}</span>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleVisible(layer.id);
        }}
        className={`transition-colors ${layer.visible ? 'text-editor-text-muted hover:text-editor-text' : 'text-editor-text-dim hover:text-editor-text-muted'}`}
        title={layer.visible ? 'Hide layer' : 'Show layer'}
      >
        {layer.visible ? <Eye size={13} /> : <EyeOff size={13} />}
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleLocked(layer.id);
        }}
        className={`transition-colors ${layer.locked ? 'text-editor-accent' : 'text-editor-text-dim hover:text-editor-text-muted'}`}
        title={layer.locked ? 'Unlock layer' : 'Lock layer'}
      >
        {layer.locked ? <Lock size={13} /> : <Unlock size={13} />}
      </button>
    </div>
  );
}

export default function LayersPanel() {
  const { canvasRef } = useCanvasContext();
  const { layers, selectedObjectId, setLayers, updateLayer, setSelectedObjectId } =
    useEditorStore();

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const canvas = canvasRef.current;
      const oldIndex = layers.findIndex((l) => l.id === active.id);
      const newIndex = layers.findIndex((l) => l.id === over.id);

      const reordered = arrayMove(layers, oldIndex, newIndex);
      setLayers(reordered);

      if (canvas) {
        const objects = canvas.getObjects();
        const targetObj = objects.find(
          (o) => (o as fabric.Object & { layerId?: string }).layerId === active.id
        );
        if (targetObj) {
          if (newIndex < oldIndex) {
            canvas.sendBackwards(targetObj);
          } else {
            canvas.bringForward(targetObj);
          }
          canvas.renderAll();
        }
      }
    },
    [canvasRef, layers, setLayers]
  );

  const handleSelect = useCallback(
    (id: string) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      setSelectedObjectId(id);
      const obj = canvas.getObjects().find(
        (o) => (o as fabric.Object & { layerId?: string }).layerId === id
      );
      if (obj) {
        canvas.setActiveObject(obj);
        canvas.renderAll();
      }
    },
    [canvasRef, setSelectedObjectId]
  );

  const handleToggleVisible = useCallback(
    (id: string) => {
      const canvas = canvasRef.current;
      const layer = layers.find((l) => l.id === id);
      if (!layer || !canvas) return;

      const newVisible = !layer.visible;
      updateLayer(id, { visible: newVisible });

      const obj = canvas.getObjects().find(
        (o) => (o as fabric.Object & { layerId?: string }).layerId === id
      );
      if (obj) {
        obj.set('visible', newVisible);
        canvas.renderAll();
      }
    },
    [canvasRef, layers, updateLayer]
  );

  const handleToggleLocked = useCallback(
    (id: string) => {
      const canvas = canvasRef.current;
      const layer = layers.find((l) => l.id === id);
      if (!layer || !canvas) return;

      const newLocked = !layer.locked;
      updateLayer(id, { locked: newLocked });

      const obj = canvas.getObjects().find(
        (o) => (o as fabric.Object & { layerId?: string }).layerId === id
      );
      if (obj) {
        obj.set({
          selectable: !newLocked,
          evented: !newLocked,
        });
        canvas.renderAll();
      }
    },
    [canvasRef, layers, updateLayer]
  );

  if (layers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center mb-3">
          <ImageIcon size={18} className="text-editor-text-dim" />
        </div>
        <p className="text-xs text-editor-text-dim">
          No layers yet.
        </p>
        <p className="text-[11px] text-editor-text-dim mt-0.5">
          Upload an image to get started.
        </p>
      </div>
    );
  }

  const displayLayers = [...layers].reverse();

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-1">
        <h3 className="text-[11px] font-semibold text-editor-text-muted uppercase tracking-widest mb-2">
          Layers
        </h3>
        <SortableContext
          items={displayLayers.map((l) => l.id)}
          strategy={verticalListSortingStrategy}
        >
          {displayLayers.map((layer) => (
            <SortableLayer
              key={layer.id}
              layer={layer}
              isSelected={selectedObjectId === layer.id}
              onSelect={handleSelect}
              onToggleVisible={handleToggleVisible}
              onToggleLocked={handleToggleLocked}
            />
          ))}
        </SortableContext>
      </div>
    </DndContext>
  );
}
