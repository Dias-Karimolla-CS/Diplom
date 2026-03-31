'use client';

import { createContext, useContext } from 'react';
import { fabric } from 'fabric';
import { useCanvas } from '@/hooks/useCanvas';
import { useHistory } from '@/hooks/useHistory';

interface CanvasContextValue {
  canvasRef: React.MutableRefObject<fabric.Canvas | null>;
  addImageFromBlob: (blob: Blob, name?: string) => Promise<void>;
  replaceActiveObjectImage: (blob: Blob) => Promise<void>;
  getActiveObjectAsBlob: () => Promise<Blob | null>;
  getFullCanvasAsBlob: () => Promise<Blob | null>;
  deleteSelected: () => void;
  setCanvasZoom: (level: number) => void;
  pushHistory: (canvas: fabric.Canvas) => void;
  undoHistory: (canvas: fabric.Canvas) => void;
  canUndo: boolean;
}

export const CanvasContext = createContext<CanvasContextValue | null>(null);

export function useCanvasContext(): CanvasContextValue {
  const ctx = useContext(CanvasContext);
  if (!ctx) {
    throw new Error('useCanvasContext must be used inside CanvasProvider');
  }
  return ctx;
}

interface CanvasProviderProps {
  children: React.ReactNode;
}

export function CanvasProvider({ children }: CanvasProviderProps) {
  const canvasOps = useCanvas();
  const history = useHistory();

  const value: CanvasContextValue = {
    ...canvasOps,
    pushHistory: history.push,
    undoHistory: history.undo,
    canUndo: history.canUndo,
  };

  return (
    <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>
  );
}
