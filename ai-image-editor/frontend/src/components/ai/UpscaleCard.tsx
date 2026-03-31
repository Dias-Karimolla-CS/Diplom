'use client';

import { useState } from 'react';
import { ZoomIn } from 'lucide-react';
import { useCanvasContext } from '@/components/editor/CanvasContext';
import { useAIOperation } from '@/hooks/useAIOperation';
import { upscaleImage } from '@/services/upscale';

export default function UpscaleCard() {
  const [scale, setScale] = useState<2 | 4>(4);
  const { getActiveObjectAsBlob, replaceActiveObjectImage } = useCanvasContext();
  const { isLoading, error, execute } = useAIOperation();

  const handleUpscale = async () => {
    await execute(async () => {
      const blob = await getActiveObjectAsBlob();
      if (!blob) throw new Error('No object selected. Please select an image layer first.');

      const result = await upscaleImage(blob, scale);
      await replaceActiveObjectImage(result);
    }, `Upscaling ${scale}x...`);
  };

  return (
    <div className="glass-card p-4 space-y-4 hover:shadow-glow/10">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(244,63,94,0.3)]">
          <ZoomIn size={15} className="text-white" />
        </div>
        <h4 className="text-[13px] font-semibold tracking-wide text-editor-text">AI Upscale</h4>
      </div>

      <div className="flex gap-2 bg-black/20 p-1.5 rounded-lg border border-white/[0.03]">
        {([2, 4] as const).map((s) => (
          <button
            key={s}
            onClick={() => setScale(s)}
            className={`
              flex-1 py-1.5 rounded-md text-[13px] font-semibold transition-all duration-300
              ${
                scale === s
                  ? 'bg-gradient-accent text-white shadow-md'
                  : 'text-editor-text-muted hover:text-white hover:bg-white/[0.05]'
              }
            `}
          >
            {s}x
          </button>
        ))}
      </div>

      {error && (
        <p className="text-[11px] text-red-400/90 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2 animate-fade-in">{error}</p>
      )}

      <button
        onClick={handleUpscale}
        disabled={isLoading}
        className="btn-primary w-full py-2.5 text-[13px] font-semibold tracking-wide shadow-[0_4px_14px_rgba(236,72,153,0.3)] relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
        <span className="relative z-10">{isLoading ? 'Enhancing Details...' : `Upscale by ${scale}x`}</span>
      </button>
    </div>
  );
}
