import { useCallback } from 'react';
import { fabric } from 'fabric';
import { Tool } from '@/types/editor.types';
import { useEditorStore } from '@/store/editorStore';

export function useActiveTool(canvas: fabric.Canvas | null) {
  const { activeTool, setActiveTool } = useEditorStore();

  const switchTool = useCallback(
    (tool: Tool) => {
      if (!canvas) return;

      setActiveTool(tool);

      switch (tool) {
        case Tool.SELECT:
          canvas.isDrawingMode = false;
          canvas.selection = true;
          canvas.defaultCursor = 'default';
          canvas.hoverCursor = 'move';
          break;

        case Tool.MOVE:
          canvas.isDrawingMode = false;
          canvas.selection = false;
          canvas.defaultCursor = 'grab';
          canvas.hoverCursor = 'grab';
          break;

        case Tool.CROP:
          canvas.isDrawingMode = false;
          canvas.selection = true;
          canvas.defaultCursor = 'crosshair';
          break;

        case Tool.MAGIC_SELECT:
          canvas.isDrawingMode = false;
          canvas.selection = false;
          canvas.defaultCursor = 'crosshair';
          canvas.hoverCursor = 'crosshair';
          break;

        default:
          break;
      }

      canvas.renderAll();
    },
    [canvas, setActiveTool]
  );

  return { activeTool, switchTool };
}
