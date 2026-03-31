export enum Tool {
  SELECT = 'select',
  MOVE = 'move',
  CROP = 'crop',
  MAGIC_SELECT = 'magic_select',
}

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  fabricObjectIndex: number;
}

export interface EditorState {
  activeTool: Tool;
  layers: Layer[];
  selectedObjectId: string | null;
  zoom: number;
  isLoading: boolean;
  loadingMessage: string;
  samPoints: Array<{ x: number; y: number; label: number }>;
}
