'use client';

import { useState } from 'react';
import { SmilePlus } from 'lucide-react';
import { useCanvasContext } from '@/components/editor/CanvasContext';
import { useAIOperation } from '@/hooks/useAIOperation';
import { restoreFaces } from '@/services/faceRestore';

export default function FaceRestoreCard() {
  const { getActiveObjectAsBlob, replaceActiveObjectImage } = useCanvasContext();
  const { isLoading, error, execute } = useAIOperation();
  const [weight, setWeight] = useState(0.5);
  const [upscale, setUpscale] = useState(2);

  const handleRestore = async () => {
    await execute(async () => {
      const blob = await getActiveObjectAsBlob();
      if (!blob) throw new Error('No object selected. Please select an image layer first.');

      const result = await restoreFaces(blob, weight, upscale);
      await replaceActiveObjectImage(result);
    }, 'Restoring faces...');
  };

  return (
    <div className="glass-card p-3 space-y-3 transition-all duration-200">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-gradient-accent flex items-center justify-center flex-shrink-0 shadow-glow">
          <SmilePlus size={14} className="text-white" />
        </div>
        <div>
          <h4 className="text-sm font-medium">Face Restoration</h4>
          <p className="text-[10px] text-editor-text-dim">GFPGAN enhancement</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between text-[11px]">
          <span className="text-editor-text-muted">Enhancement</span>
          <span className="text-editor-text tabular-nums">{(weight * 100).toFixed(0)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={weight}
          onChange={(e) => setWeight(parseFloat(e.target.value))}
          className="w-full"
        />
      </div>

      <div className="space-y-1.5">
        <span className="text-[11px] text-editor-text-muted">Upscale</span>
        <div className="flex gap-1.5">
          {[1, 2, 4].map((s) => (
            <button
              key={s}
              onClick={() => setUpscale(s)}
              className={`
                flex-1 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border
                ${
                  upscale === s
                    ? 'btn-toggle-active'
                    : 'btn-toggle'
                }
              `}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="text-[11px] text-red-400/90 bg-red-400/5 rounded-lg px-2.5 py-1.5">{error}</p>
      )}

      <button
        onClick={handleRestore}
        disabled={isLoading}
        className="btn-primary w-full py-2 text-xs"
      >
        {isLoading ? 'Processing...' : 'Restore Faces'}
      </button>
    </div>
  );
}
