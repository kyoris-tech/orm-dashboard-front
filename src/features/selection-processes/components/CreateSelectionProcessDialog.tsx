'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Briefcase } from 'lucide-react';
import { ModalPortal } from '@/components/ui/ModalPortal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { JobOpeningPicker } from '@/features/job-openings/components/JobOpeningPicker';

export interface CreateSelectionProcessDialogProps {
  isOpen: boolean;
  candidateCount: number;
  isSubmitting?: boolean;
  onSubmit: (name: string, jobOpeningId: string) => void;
  onCancel: () => void;
}

export function CreateSelectionProcessDialog({ isOpen, candidateCount, isSubmitting, onSubmit, onCancel }: CreateSelectionProcessDialogProps) {
  const [name, setName] = useState('');
  const [jobOpeningId, setJobOpeningId] = useState('');
  const [wasOpen, setWasOpen] = useState(isOpen);

  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);

    if (isOpen) {
      setName('');
      setJobOpeningId('');
    }
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (name.trim() === '') {
      return;
    }

    onSubmit(name.trim(), jobOpeningId);
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
              <h2 className="text-2xl font-semibold text-accent mb-2">Abrir processo seletivo</h2>
              <p className="text-muted text-sm mb-6">
                {candidateCount} candidato{candidateCount === 1 ? '' : 's'} selecionado{candidateCount === 1 ? '' : 's'}.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-6 items-center">
                <Input
                  label="Nome do processo"
                  icon={Briefcase}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  autoFocus
                />

                <div className="w-full flex flex-col gap-2 text-left">
                  <span className="text-sm font-medium text-foreground">Vincular a uma vaga (opcional)</span>
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

                  <Button type="submit" variant="accent" loading={isSubmitting} className="flex-1 !w-auto">
                    Criar
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
