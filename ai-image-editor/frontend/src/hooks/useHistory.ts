import { useRef, useState, useCallback } from 'react';
import { fabric } from 'fabric';

const MAX_HISTORY = 50;

export function useHistory() {
  const historyRef = useRef<string[]>([]);
  const [canUndo, setCanUndo] = useState(false);

  /** Save current canvas state to history. */
  const push = useCallback((canvas: fabric.Canvas) => {
    const json = JSON.stringify(canvas.toJSON(['layerId']));
    const history = historyRef.current;

    // Avoid duplicate consecutive states
    if (history.length > 0 && history[history.length - 1] === json) return;

    history.push(json);
    if (history.length > MAX_HISTORY) {
      history.shift();
    }
    setCanUndo(history.length > 1);
  }, []);

  /** Restore the previous canvas state. */
  const undo = useCallback((canvas: fabric.Canvas) => {
    const history = historyRef.current;
    if (history.length <= 1) return;

    // Pop the current state
    history.pop();
    const previousJson = history[history.length - 1];

    canvas.loadFromJSON(previousJson, () => {
      canvas.renderAll();
    });

    setCanUndo(history.length > 1);
  }, []);

  return { push, undo, canUndo };
}
