'use client';

import { memo } from 'react';
import { X } from 'lucide-react';
import { Modal } from './Modal';
import { SecondaryButton } from './SecondaryButton';
import { cn } from '@/lib/utils/cn';

export interface ConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  tone?: 'default' | 'danger';
}

function ConfirmDialogComponent({
  isOpen,
  title = 'Confirmação',
  message = 'Tem certeza que deseja realizar esta ação?',
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
  tone = 'default',
}: ConfirmDialogProps) {
  const isDanger = tone === 'danger';

  return (
    <Modal isOpen={isOpen} className="text-center relative">
      <button onClick={onCancel} title="Fechar" aria-label="Fechar" className="absolute top-4 right-4 text-muted hover:text-accent transition">
        <X size={20} />
      </button>

      <h2 className={cn('text-2xl font-semibold mb-4', isDanger ? 'text-danger' : 'text-accent')}>{title}</h2>

      <p className="text-foreground text-sm mb-8 leading-relaxed">{message}</p>

      <div className="flex justify-center gap-4">
        <SecondaryButton onClick={onCancel}>{cancelLabel}</SecondaryButton>

        <button
          onClick={onConfirm}
          className={cn(
            'px-6 py-2 rounded-full text-white transition font-medium',
            isDanger ? 'bg-danger hover:brightness-110' : 'bg-accent hover:bg-accent-dark',
          )}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

export const ConfirmDialog = memo(ConfirmDialogComponent);
