'use client';

import { useState } from 'react';
import { Sun } from 'lucide-react';
import { useCanvasContext } from '@/components/editor/CanvasContext';
import { useAIOperation } from '@/hooks/useAIOperation';
import { correctColors } from '@/services/colorCorrection';

export default function ColorCorrectionCard() {
  const [iterations, setIterations] = useState(8);
  const { getActiveObjectAsBlob, replaceActiveObjectImage } = useCanvasContext();
  const { isLoading, error, execute } = useAIOperation();

  const handleEnhance = async () => {
    await execute(async () => {
      const blob = await getActiveObjectAsBlob();
      if (!blob) throw new Error('No object selected. Please select an image layer first.');

      const result = await correctColors(blob, iterations);
      await replaceActiveObjectImage(result);
    }, 'Enhancing colors...');
  };

  return (
    <div className="glass-card p-3 space-y-3 transition-all duration-200">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-gradient-accent flex items-center justify-center flex-shrink-0 shadow-glow">
          <Sun size={14} className="text-white" />
        </div>
        <h4 className="text-sm font-medium">Color Enhancement</h4>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between text-[11px]">
          <span className="text-editor-text-muted">Iterations</span>
          <span className="text-editor-text tabular-nums">{iterations}</span>
        </div>
        <input
          type="range"
          min={1}
          max={16}
          step={1}
          value={iterations}
          onChange={(e) => setIterations(Number(e.target.value))}
          className="w-full"
        />
      </div>

      {error && (
        <p className="text-[11px] text-red-400/90 bg-red-400/5 rounded-lg px-2.5 py-1.5">{error}</p>
      )}

      <button
        onClick={handleEnhance}
        disabled={isLoading}
        className="btn-primary w-full py-2 text-xs"
      >
        {isLoading ? 'Processing...' : 'Enhance Colors'}
      </button>
    </div>
  );
}
