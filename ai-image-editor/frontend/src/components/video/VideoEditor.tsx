'use client';

import React, { useRef, useState, useCallback } from 'react';
import { Video, Upload, Download, Loader2 } from 'lucide-react';
import { uploadVideoForUpscale } from '@/services/videoUpscale';

type ProcessingState = 'idle' | 'uploading' | 'processing' | 'done' | 'error';

export default function VideoEditor() {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [scale, setScale] = useState<2 | 4>(4);
  const [state, setState] = useState<ProcessingState>('idle');
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('video/')) return;
    setSourceFile(file);
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    setSourceUrl(URL.createObjectURL(file));
    setResultUrl(null);
    setState('idle');
    setErrorMsg('');
  }, [sourceUrl]);

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const handleUpscale = async () => {
    if (!sourceFile) return;
    setState('uploading');
    setProgress(0);
    setErrorMsg('');

    try {
      const blob = await uploadVideoForUpscale(sourceFile, scale, (pct) => {
        setProgress(pct);
        if (pct === 100) setState('processing');
      });

      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(blob));
      setState('done');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'An unexpected error occurred.';
      setErrorMsg(message);
      setState('error');
    }
  };

  const handleDownload = () => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = 'upscaled_video.mp4';
    a.click();
  };

  const isRunning = state === 'uploading' || state === 'processing';

  return (
    <div className="flex flex-col gap-6 p-6 max-w-3xl mx-auto min-h-full text-editor-text">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-accent flex items-center justify-center shadow-glow">
          <Video size={18} className="text-white" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Video Upscaler</h2>
          <p className="text-xs text-editor-text-dim">AI-powered video upscaling with Real-ESRGAN</p>
        </div>
      </div>

      {/* Drop zone */}
      <div
        className={`
          glass-card flex flex-col items-center justify-center gap-3 p-10 cursor-pointer
          transition-all duration-200 border-2 border-dashed
          ${isDragging
            ? 'border-editor-accent bg-editor-accent/5'
            : '!border-white/[0.06] hover:!border-editor-accent/30 hover:bg-white/[0.02]'
          }
        `}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="w-12 h-12 rounded-xl bg-white/[0.04] flex items-center justify-center">
          <Upload size={22} className="text-editor-text-muted" />
        </div>
        <div className="text-center">
          <p className="text-sm text-editor-text-muted">
            Drag & drop a video here, or click to select
          </p>
          {sourceFile && (
            <p className="text-xs text-editor-text mt-2 truncate max-w-xs">
              {sourceFile.name}
            </p>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={onFileInputChange}
        />
      </div>

      {/* Source preview */}
      {sourceUrl && (
        <div className="flex flex-col gap-2">
          <p className="text-[11px] font-medium text-editor-text-muted uppercase tracking-widest">Source</p>
          <video
            src={sourceUrl}
            controls
            className="rounded-xl w-full max-h-64 bg-black/50"
          />
        </div>
      )}

      {/* Upscale controls */}
      {sourceFile && (
        <div className="glass-card p-4 space-y-4">
          <p className="text-sm font-medium">Upscale Settings</p>

          <div className="flex gap-2">
            {([2, 4] as const).map((s) => (
              <button
                key={s}
                onClick={() => setScale(s)}
                disabled={isRunning}
                className={`
                  px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 border
                  ${scale === s
                    ? 'btn-toggle-active'
                    : 'btn-toggle'
                  } disabled:opacity-40
                `}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Progress */}
          {(state === 'uploading' || state === 'processing') && (
            <div className="space-y-2">
              <div className="flex justify-between text-[11px] text-editor-text-muted">
                <span>
                  {state === 'uploading' ? 'Uploading...' : 'Processing frames...'}
                </span>
                {state === 'uploading' && <span className="tabular-nums">{progress}%</span>}
              </div>
              <div className="w-full bg-white/[0.04] rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-gradient-accent rounded-full transition-all duration-300"
                  style={{
                    width: state === 'processing' ? '100%' : `${progress}%`,
                    ...(state === 'processing' ? { animation: 'pulse 2s ease-in-out infinite' } : {}),
                  }}
                />
              </div>
            </div>
          )}

          {state === 'error' && (
            <p className="text-[11px] text-red-400/90 bg-red-400/5 rounded-lg px-3 py-2">{errorMsg}</p>
          )}

          <button
            onClick={handleUpscale}
            disabled={isRunning || !sourceFile}
            className="btn-primary flex items-center justify-center gap-2 w-full py-2.5 text-sm"
          >
            {isRunning ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                {state === 'uploading' ? 'Uploading...' : 'Processing...'}
              </>
            ) : (
              <>
                <Video size={15} />
                Upscale Video
              </>
            )}
          </button>
        </div>
      )}

      {/* Result */}
      {state === 'done' && resultUrl && (
        <div className="space-y-3">
          <p className="text-[11px] font-medium text-editor-text-muted uppercase tracking-widest">Result</p>
          <video
            src={resultUrl}
            controls
            className="rounded-xl w-full max-h-64 bg-black/50"
          />
          <button
            onClick={handleDownload}
            className="btn-primary flex items-center gap-2 px-4 py-2 text-sm w-fit"
          >
            <Download size={15} />
            Download
          </button>
        </div>
      )}
    </div>
  );
}
