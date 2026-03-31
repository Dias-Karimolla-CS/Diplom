import { useState, useCallback } from 'react';
import { useEditorStore } from '@/store/editorStore';

export function useAIOperation() {
  const [error, setError] = useState<string | null>(null);
  const { isLoading, setLoading } = useEditorStore();

  const execute = useCallback(
    async <T>(fn: () => Promise<T>, loadingMessage = 'Processing...'): Promise<T | null> => {
      setError(null);
      setLoading(true, loadingMessage);
      try {
        const result = await fn();
        return result;
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : 'An unexpected error occurred.';
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [setLoading]
  );

  return { isLoading, error, execute };
}
