'use client';

import { memo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { ModalPortal } from './ModalPortal';
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
    <ModalPortal>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="bg-surface rounded-2xl shadow-2xl w-full max-w-md p-8 text-center relative"
            >
              <button onClick={onCancel} className="absolute top-4 right-4 text-muted hover:text-accent transition">
                <X size={20} />
              </button>

              <h2 className={cn('text-2xl font-semibold mb-4', isDanger ? 'text-danger' : 'text-accent')}>{title}</h2>

              <p className="text-foreground text-sm mb-8 leading-relaxed">{message}</p>

              <div className="flex justify-center gap-4">
                <button
                  onClick={onCancel}
                  className="px-6 py-2 rounded-full border border-border text-muted hover:bg-surface-soft transition font-medium"
                >
                  {cancelLabel}
                </button>

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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ModalPortal>
  );
}

export const ConfirmDialog = memo(ConfirmDialogComponent);
