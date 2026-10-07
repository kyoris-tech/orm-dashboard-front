import { ConfirmDialog } from './ConfirmDialog';

export interface DiscardChangesDialogProps {
  isOpen: boolean;
  onKeepEditing: () => void;
  onDiscard: () => void;
}

export function DiscardChangesDialog({ isOpen, onKeepEditing, onDiscard }: DiscardChangesDialogProps) {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      title="Descartar alterações?"
      message="Você tem alterações que ainda não foram salvas. Se sair agora, elas serão perdidas."
      confirmLabel="Descartar"
      cancelLabel="Continuar editando"
      tone="danger"
      onConfirm={onDiscard}
      onCancel={onKeepEditing}
    />
  );
}
