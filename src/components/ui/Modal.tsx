'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ModalPortal } from './ModalPortal';
import { cn } from '@/lib/utils/cn';

export type ModalSize = 'md' | 'lg';

export interface ModalProps {
  isOpen: boolean;
  size?: ModalSize;
  className?: string;
  children: React.ReactNode;
}

const SIZE_CLASSES: Record<ModalSize, string> = {
  md: 'max-w-md',
  lg: 'max-w-lg',
};

export function Modal({ isOpen, size = 'md', className, children }: ModalProps) {
  return (
    <ModalPortal>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className={cn('bg-surface rounded-2xl shadow-2xl w-full p-8', SIZE_CLASSES[size], className)}
            >
              {children}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ModalPortal>
  );
}
