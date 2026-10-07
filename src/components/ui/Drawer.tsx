'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { ModalPortal } from './ModalPortal';
import { useEscapeToClose } from '@/lib/hooks/use-escape-to-close';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

const ENTER_TRANSITION = { duration: 0.22, ease: [0.16, 1, 0.3, 1] } as const;
const EXIT_TRANSITION = { duration: 0.16, ease: 'easeIn' } as const;

export function Drawer({ isOpen, onClose, title, children }: DrawerProps) {
  useEscapeToClose(isOpen, onClose);

  return (
    <ModalPortal>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: ENTER_TRANSITION }}
            exit={{ opacity: 0, transition: EXIT_TRANSITION }}
            onClick={onClose}
          >
            <motion.div
              onClick={(event) => event.stopPropagation()}
              initial={{ x: '100%' }}
              animate={{ x: 0, transition: ENTER_TRANSITION }}
              exit={{ x: '100%', transition: EXIT_TRANSITION }}
              className="absolute top-0 right-0 h-full w-full max-w-md bg-surface shadow-2xl flex flex-col transform-gpu"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-border">
                {title && <h2 className="text-lg font-semibold text-primary">{title}</h2>}
                <button onClick={onClose} title="Fechar" aria-label="Fechar" className="text-muted hover:text-accent transition ml-auto">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-5">{children}</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ModalPortal>
  );
}
