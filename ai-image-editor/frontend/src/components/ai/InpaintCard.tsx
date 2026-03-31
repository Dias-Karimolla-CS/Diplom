'use client';

import { Eraser, X } from 'lucide-react';
import { useCanvasContext } from '@/components/editor/CanvasContext';
import { useAIOperation } from '@/hooks/useAIOperation';
import { useEditorStore } from '@/store/editorStore';
import { inpaintObject } from '@/services/inpaint';
import { Tool } from '@/types/editor.types';

export default function InpaintCard() {
  const { getActiveObjectAsBlob, replaceActiveObjectImage } = useCanvasContext();
  const { isLoading, error, execute } = useAIOperation();
  const {
    activeTool,
    setActiveTool,
    samPoints,
    clearSamPoints,
  } = useEditorStore();

  const isSelectMode = activeTool === Tool.MAGIC_SELECT;

  const toggleSelectMode = () => {
    if (isSelectMode) {
      setActiveTool(Tool.SELECT);
    } else {
      setActiveTool(Tool.MAGIC_SELECT);
    }
  };

  const handleInpaint = async () => {
    if (samPoints.length === 0) return;

    await execute(async () => {
      const blob = await getActiveObjectAsBlob();
      if (!blob) throw new Error('No object selected. Please select an image layer first.');

      const points: Array<[number, number]> = samPoints.map((p) => [p.x, p.y]);
      const labels = samPoints.map((p) => p.label);

      const result = await inpaintObject(blob, points, labels);
      await replaceActiveObjectImage(result);

      clearSamPoints();
      setActiveTool(Tool.SELECT);
    }, 'Removing object...');
  };

  return (
    <div className="glass-card p-3 space-y-3 transition-all duration-200">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-gradient-accent flex items-center justify-center flex-shrink-0 shadow-glow">
          <Eraser size={14} className="text-white" />
        </div>
        <div>
          <h4 className="text-sm font-medium">Object Removal</h4>
          <p className="text-[10px] text-editor-text-dim">LaMa inpainting</p>
        </div>
      </div>

      <button
        onClick={toggleSelectMode}
        className={`
          w-full py-2 rounded-lg text-xs font-medium transition-all duration-200 border
          ${
            isSelectMode
              ? 'btn-toggle-active'
              : 'btn-toggle'
          }
        `}
      >
        {isSelectMode ? 'Exit Point Selection' : 'Enter Point Selection'}
      </button>

      {samPoints.length > 0 && (
        <div className="flex items-center justify-between text-[11px] text-editor-text-muted bg-white/[0.02] rounded-lg px-2.5 py-1.5">
          <span>{samPoints.length} point(s)</span>
          <button
            onClick={clearSamPoints}
            className="flex items-center gap-1 hover:text-red-400 transition-colors"
          >
            <X size={11} />
            Clear
          </button>
        </div>
      )}

      {error && (
        <p className="text-[11px] text-red-400/90 bg-red-400/5 rounded-lg px-2.5 py-1.5">{error}</p>
      )}

      <button
        onClick={handleInpaint}
        disabled={isLoading || samPoints.length === 0}
        className="btn-primary w-full py-2 text-xs"
      >
        {isLoading ? 'Processing...' : 'Remove Object'}
      </button>
    </div>
  );
}
