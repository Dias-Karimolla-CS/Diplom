'use client';

import { MousePointer2, Move, Crop, Wand2 } from 'lucide-react';
import { Tool } from '@/types/editor.types';
import { useEditorStore } from '@/store/editorStore';
import { useCanvasContext } from '@/components/editor/CanvasContext';
import { useActiveTool } from '@/hooks/useActiveTool';

const tools: { tool: Tool; label: string; Icon: React.ElementType }[] = [
  { tool: Tool.SELECT, label: 'Select', Icon: MousePointer2 },
  { tool: Tool.MOVE, label: 'Move', Icon: Move },
  { tool: Tool.CROP, label: 'Crop', Icon: Crop },
  { tool: Tool.MAGIC_SELECT, label: 'Magic Select', Icon: Wand2 },
];

export default function LeftToolbar() {
  const { canvasRef } = useCanvasContext();
  const { activeTool } = useEditorStore();
  const { switchTool } = useActiveTool(canvasRef.current);

  return (
    <div className="w-[60px] flex flex-col items-center gap-3 py-4 border-r border-white/[0.04] bg-editor-panel/75 backdrop-blur-2xl flex-shrink-0 z-10 shadow-[20px_0_40px_rgba(0,0,0,0.1)] relative">
      <div className="flex flex-col gap-2 bg-black/20 p-1.5 rounded-2xl border border-white/[0.03]">
        {tools.map(({ tool, label, Icon }) => (
          <div key={tool} className="relative group">
            <button
              onClick={() => switchTool(tool)}
              className={`
                w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300
                ${
                  activeTool === tool
                    ? 'bg-gradient-accent text-white shadow-glow translate-x-[2px]'
                    : 'text-editor-text-muted hover:bg-white/[0.06] hover:text-white hover:scale-105'
                }
              `}
            >
              <Icon size={18} strokeWidth={activeTool === tool ? 2.5 : 2} />
            </button>
            {/* Tooltip */}
            <div className="absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-editor-bg/95 backdrop-blur-md border border-white/[0.08] rounded-lg text-xs font-medium text-editor-text whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-50 shadow-xl">
              {label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
