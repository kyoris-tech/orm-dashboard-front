'use client';

import { useCallback, useRef, useState } from 'react';
import { useDeleteResumeMutation } from './use-delete-resume-mutation';
import { useRestoreResumeMutation } from './use-restore-resume-mutation';

const UNDO_WINDOW_MS = 6000;

export function useUndoableDelete() {
  const deleteResumeMutation = useDeleteResumeMutation();
  const restoreResumeMutation = useRestoreResumeMutation();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearPending = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setPendingId(null);
  }, []);

  const requestDelete = useCallback(
    (id: string, onDeleted?: () => void) => {
      deleteResumeMutation.mutate(id, {
        onSuccess: () => {
          setPendingId(id);
          timeoutRef.current = setTimeout(clearPending, UNDO_WINDOW_MS);
          onDeleted?.();
        },
      });
    },
    [deleteResumeMutation, clearPending],
  );

  const undoDelete = useCallback(() => {
    if (!pendingId) {
      return;
    }

    const id = pendingId;
    clearPending();
    restoreResumeMutation.mutate(id);
  }, [pendingId, clearPending, restoreResumeMutation]);

  return {
    requestDelete,
    undoDelete,
    dismiss: clearPending,
    pendingId,
    isDeleting: deleteResumeMutation.isPending,
  };
}
