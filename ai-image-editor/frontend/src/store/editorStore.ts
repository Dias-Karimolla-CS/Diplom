import { create } from 'zustand';
import { Tool, Layer } from '@/types/editor.types';

interface EditorStore {
  activeTool: Tool;
  layers: Layer[];
  selectedObjectId: string | null;
  zoom: number;
  isLoading: boolean;
  loadingMessage: string;
  samPoints: Array<{ x: number; y: number; label: number }>;

  setActiveTool: (tool: Tool) => void;
  setLayers: (layers: Layer[]) => void;
  addLayer: (layer: Layer) => void;
  updateLayer: (id: string, updates: Partial<Layer>) => void;
  removeLayer: (id: string) => void;
  setSelectedObjectId: (id: string | null) => void;
  setZoom: (zoom: number) => void;
  setLoading: (loading: boolean, message?: string) => void;
  addSamPoint: (point: { x: number; y: number; label: number }) => void;
  clearSamPoints: () => void;
}

export const useEditorStore = create<EditorStore>((set) => ({
  activeTool: Tool.SELECT,
  layers: [],
  selectedObjectId: null,
  zoom: 1,
  isLoading: false,
  loadingMessage: '',
  samPoints: [],

  setActiveTool: (tool) => set({ activeTool: tool }),

  setLayers: (layers) => set({ layers }),

  addLayer: (layer) =>
    set((state) => ({ layers: [...state.layers, layer] })),

  updateLayer: (id, updates) =>
    set((state) => ({
      layers: state.layers.map((l) => (l.id === id ? { ...l, ...updates } : l)),
    })),

  removeLayer: (id) =>
    set((state) => ({ layers: state.layers.filter((l) => l.id !== id) })),

  setSelectedObjectId: (id) => set({ selectedObjectId: id }),

  setZoom: (zoom) => set({ zoom }),

  setLoading: (loading, message = '') =>
    set({ isLoading: loading, loadingMessage: message }),

  addSamPoint: (point) =>
    set((state) => ({ samPoints: [...state.samPoints, point] })),

  clearSamPoints: () => set({ samPoints: [] }),
}));
