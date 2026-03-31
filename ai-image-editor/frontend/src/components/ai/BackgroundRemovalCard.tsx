'use client';

import { useState } from 'react';
import { Scissors } from 'lucide-react';
import { useCanvasContext } from '@/components/editor/CanvasContext';
import { useAIOperation } from '@/hooks/useAIOperation';
import { removeBackground } from '@/services/backgroundRemoval';

export default function BackgroundRemovalCard() {
  const [threshold, setThreshold] = useState(0.5);
  const { getActiveObjectAsBlob, replaceActiveObjectImage } = useCanvasContext();
  const { isLoading, error, execute } = useAIOperation();

  const handleRemove = async () => {
    await execute(async () => {
      const blob = await getActiveObjectAsBlob();
      if (!blob) throw new Error('No object selected. Please select an image layer first.');

      const result = await removeBackground(blob, threshold);
      await replaceActiveObjectImage(result);
    }, 'Removing background...');
  };

  return (
    <div className="glass-card p-4 space-y-4 hover:shadow-glow/10">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
          <Scissors size={15} className="text-white" />
        </div>
        <h4 className="text-[13px] font-semibold tracking-wide text-editor-text">Background Removal</h4>
      </div>

      <div className="space-y-2 bg-black/20 p-3 rounded-lg border border-white/[0.03]">
        <div className="flex justify-between text-[11px] font-medium">
          <span className="text-editor-text-muted">Threshold</span>
          <span className="text-editor-text tabular-nums text-editor-accent">{threshold.toFixed(2)}</span>
        </div>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={threshold}
          onChange={(e) => setThreshold(Number(e.target.value))}
          className="w-full"
        />
      </div>

      {error && (
        <p className="text-[11px] text-red-400/90 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2 animate-fade-in">{error}</p>
      )}

      <button
        onClick={handleRemove}
        disabled={isLoading}
        className="btn-primary w-full py-2.5 text-[13px] font-semibold tracking-wide shadow-[0_4px_14px_rgba(139,92,246,0.3)] relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
        <span className="relative z-10">{isLoading ? 'Processing Neural Net...' : 'Remove Background'}</span>
      </button>
    </div>
  );
}
