'use client';

import { useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { ModalPortal } from './ModalPortal';
import { cn } from '@/lib/utils/cn';
import { useEscapeToClose } from '@/lib/hooks/use-escape-to-close';

export type ModalSize = 'md' | 'lg';

export interface ModalProps {
  isOpen: boolean;
  size?: ModalSize;
  className?: string;
  footer?: React.ReactNode;
  onClose?: () => void;
  children: React.ReactNode;
}

const ENTER_TRANSITION = { duration: 0.18, ease: [0.16, 1, 0.3, 1] } as const;
const EXIT_TRANSITION = { duration: 0.12, ease: 'easeIn' } as const;

const SIZE_CLASSES: Record<ModalSize, string> = {
  md: 'max-w-md',
  lg: 'max-w-lg',
};

export function Modal({ isOpen, size = 'md', className, footer, onClose, children }: ModalProps) {
  const pressStartedOnBackdrop = useRef(false);

  useEscapeToClose(isOpen, onClose);

  return (
    <ModalPortal>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onMouseDown={(event) => {
              pressStartedOnBackdrop.current = event.target === event.currentTarget;
            }}
            onClick={(event) => {
              if (onClose && pressStartedOnBackdrop.current && event.target === event.currentTarget) {
                onClose();
              }
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: ENTER_TRANSITION }}
            exit={{ opacity: 0, transition: EXIT_TRANSITION }}
          >
            <motion.div
              initial={{ scale: 0.97, opacity: 0, y: 8 }}
              animate={{ scale: 1, opacity: 1, y: 0, transition: ENTER_TRANSITION }}
              exit={{ scale: 0.98, opacity: 0, y: 4, transition: EXIT_TRANSITION }}
              className={cn(
                'relative bg-surface rounded-2xl shadow-2xl w-full flex flex-col overflow-hidden transform-gpu',
                SIZE_CLASSES[size],
                className,
              )}
            >
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  title="Fechar"
                  aria-label="Fechar"
                  className="absolute top-4 right-4 z-10 rounded-full p-1 text-muted hover:text-accent hover:bg-surface-soft transition"
                >
                  <X size={20} />
                </button>
              )}

              <div className={cn('flex flex-col flex-1 min-h-0 overflow-y-auto overscroll-contain p-8 [scrollbar-width:thin]', footer && 'pb-6')}>
                {children}
              </div>

              {footer && <div className="shrink-0 border-t border-border bg-surface px-8 py-4">{footer}</div>}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ModalPortal>
  );
}
