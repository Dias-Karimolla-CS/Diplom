'use client';

import { useEditorStore } from '@/store/editorStore';

export default function CanvasOverlay() {
  const { isLoading, loadingMessage } = useEditorStore();

  if (!isLoading) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-editor-bg/40 backdrop-blur-md z-50 animate-fade-in">
      <div className="glass-panel flex flex-col items-center justify-center min-w-[200px] p-6 rounded-2xl shadow-glow-lg border border-white/[0.08] animate-slide-up">
        {/* Gradient spinner */}
        <div className="relative w-14 h-14 mb-5">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 opacity-20 blur-md animate-pulse-glow" />
          <div className="absolute inset-0 rounded-full border-[3px] border-t-indigo-400 border-r-pink-400 border-b-transparent border-l-transparent animate-spin-slow" />
          <div className="absolute inset-2 rounded-full border-[2px] border-b-purple-400 border-l-rose-400 border-t-transparent border-r-transparent animate-[spin_1.5s_linear_infinite_reverse]" />
        </div>
        {loadingMessage && (
          <p className="text-white text-[13px] font-semibold tracking-wide text-center">
            {loadingMessage}
          </p>
        )}
      </div>
    </div>
  );
}
