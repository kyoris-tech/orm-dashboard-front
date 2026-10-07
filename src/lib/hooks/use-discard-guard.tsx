'use client';

import { useState } from 'react';
import { DiscardChangesDialog } from '@/components/ui/DiscardChangesDialog';

export function useDiscardGuard(isDirty: boolean, onClose: () => void) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  function requestClose() {
    if (isConfirmOpen) {
      return;
    }

    if (isDirty) {
      setIsConfirmOpen(true);
      return;
    }

    onClose();
  }

  function discard() {
    setIsConfirmOpen(false);
    onClose();
  }

  const discardDialog = <DiscardChangesDialog isOpen={isConfirmOpen} onKeepEditing={() => setIsConfirmOpen(false)} onDiscard={discard} />;

  return { requestClose, discardDialog };
}
