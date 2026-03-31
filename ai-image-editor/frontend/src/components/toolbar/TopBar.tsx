'use client';

import { useRef } from 'react';
import { Undo2, Upload, Download, ZoomIn, ImageIcon, Film, Wand2 } from 'lucide-react';
import { useCanvasContext } from '@/components/editor/CanvasContext';
import { useEditorStore } from '@/store/editorStore';
import { downloadCanvasAsPNG } from '@/lib/downloadUtils';

interface TopBarProps {
  activeTab: string;
  onTabChange: (tab: 'image' | 'video') => void;
}

export default function TopBar({ activeTab, onTabChange }: TopBarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { canvasRef, addImageFromBlob, undoHistory, canUndo } = useCanvasContext();
  const { zoom } = useEditorStore();

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    addImageFromBlob(file, file.name);
    e.target.value = '';
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    downloadCanvasAsPNG(canvas);
  };

  const handleUndo = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    undoHistory(canvas);
  };

  return (
    <header className="h-[52px] flex items-center justify-between px-5 border-b border-white/[0.04] bg-editor-panel/75 backdrop-blur-2xl flex-shrink-0 relative z-20 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
      {/* Left: Logo + Tabs */}
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2 select-none group cursor-pointer">
          <div className="w-6 h-6 rounded-md bg-gradient-accent flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-all duration-300">
            <Wand2 size={14} className="text-white" />
          </div>
          <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 text-sm tracking-wide">
            Nova<span className="text-transparent bg-clip-text bg-gradient-accent">Edit</span>
          </span>
        </div>

        {/* Tab navigation */}
        <nav className="flex items-center gap-1 bg-black/20 p-1 rounded-lg border border-white/[0.03]">
          <button
            onClick={() => onTabChange('image')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-300 ${
              activeTab === 'image'
                ? 'bg-white/[0.1] text-white shadow-[0_2px_10px_rgba(0,0,0,0.2)]'
                : 'text-editor-text-muted hover:text-editor-text hover:bg-white/[0.05]'
            }`}
          >
            <ImageIcon size={14} />
            Image
          </button>
          <button
            onClick={() => onTabChange('video')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-300 ${
              activeTab === 'video'
                ? 'bg-white/[0.1] text-white shadow-[0_2px_10px_rgba(0,0,0,0.2)]'
                : 'text-editor-text-muted hover:text-editor-text hover:bg-white/[0.05]'
            }`}
          >
            <Film size={14} />
            Video
          </button>
        </nav>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <button
          title="Undo (Ctrl+Z)"
          disabled={!canUndo}
          onClick={handleUndo}
          className="p-2 rounded-lg text-editor-text-muted hover:text-white hover:bg-white/[0.08] disabled:opacity-30 transition-all duration-300"
        >
          <Undo2 size={16} />
        </button>

        {/* Separator */}
        <div className="w-[1px] h-5 bg-white/[0.08] mx-2" />

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black/20 border border-white/[0.03] text-xs text-editor-text-dim select-none tabular-nums">
          <ZoomIn size={14} className="text-editor-text-muted" />
          <span className="font-medium">{Math.round(zoom * 100)}%</span>
        </div>

        <div className="w-[1px] h-5 bg-white/[0.08] mx-2" />

        <button
          title="Upload Image"
          onClick={() => fileInputRef.current?.click()}
          className="btn-ghost flex items-center gap-2 px-4 py-2 text-[13px]"
        >
          <Upload size={14} />
          Upload
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleUpload}
        />

        <button
          title="Export as PNG"
          onClick={handleDownload}
          className="btn-primary flex items-center gap-2 px-4 py-2 text-[13px] ml-1"
        >
          <Download size={14} />
          Export
        </button>
      </div>
    </header>
  );
}
