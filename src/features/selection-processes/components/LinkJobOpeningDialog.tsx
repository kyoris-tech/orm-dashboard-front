'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ModalPortal } from '@/components/ui/ModalPortal';
import { Button } from '@/components/ui/Button';
import { JobOpeningPicker } from '@/features/job-openings/components/JobOpeningPicker';

export interface LinkJobOpeningDialogProps {
  isOpen: boolean;
  currentJobOpeningId?: string | null;
  isSubmitting?: boolean;
  onSubmit: (jobOpeningId: string) => void;
  onCancel: () => void;
}

export function LinkJobOpeningDialog({ isOpen, currentJobOpeningId, isSubmitting, onSubmit, onCancel }: LinkJobOpeningDialogProps) {
  const [jobOpeningId, setJobOpeningId] = useState(currentJobOpeningId ?? '');
  const [wasOpen, setWasOpen] = useState(isOpen);

  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);

    if (isOpen) {
      setJobOpeningId(currentJobOpeningId ?? '');
    }
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (jobOpeningId.trim() === '') {
      return;
    }

    onSubmit(jobOpeningId);
  }

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
              className="bg-surface rounded-2xl shadow-2xl w-full max-w-md p-8 text-center"
            >
              <h2 className="text-2xl font-semibold text-accent mb-6">Vincular vaga</h2>

              <form onSubmit={handleSubmit} className="flex flex-col gap-6 items-center">
                <div className="w-full flex flex-col gap-2 text-left">
                  <span className="text-sm font-medium text-foreground">Vaga</span>
                  <JobOpeningPicker value={jobOpeningId} onChange={setJobOpeningId} />
                </div>

                <div className="flex gap-4 w-full">
                  <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 px-6 py-2 rounded-full border border-border text-muted hover:bg-surface-soft transition font-medium"
                  >
                    Cancelar
                  </button>

                  <Button type="submit" variant="accent" loading={isSubmitting} disabled={jobOpeningId.trim() === ''} className="flex-1 !w-auto">
                    Vincular
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ModalPortal>
  );
}
