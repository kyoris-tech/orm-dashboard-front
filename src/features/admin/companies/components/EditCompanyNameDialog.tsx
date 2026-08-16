'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Building2 } from 'lucide-react';
import { ModalPortal } from '@/components/ui/ModalPortal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { CompanySummary } from '@/types/company';

export interface EditCompanyNameDialogProps {
  isOpen: boolean;
  company: CompanySummary | null;
  isSubmitting?: boolean;
  onSubmit: (name: string) => void;
  onCancel: () => void;
}

export function EditCompanyNameDialog({ isOpen, company, isSubmitting, onSubmit, onCancel }: EditCompanyNameDialogProps) {
  const [name, setName] = useState('');
  const [wasOpen, setWasOpen] = useState(isOpen);

  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);

    if (isOpen) {
      setName(company?.name ?? '');
    }
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const trimmed = name.trim();

    if (trimmed === '') {
      return;
    }

    onSubmit(trimmed);
  }

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
              className="bg-surface rounded-2xl shadow-2xl w-full max-w-md p-8"
            >
              <h2 className="text-2xl font-semibold text-accent mb-6 text-center">Editar nome da empresa</h2>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <Input label="Nome da empresa" icon={Building2} value={name} onChange={(event) => setName(event.target.value)} required autoFocus />

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 px-6 py-2 rounded-full border border-border text-muted hover:bg-surface-soft transition font-medium"
                  >
                    Cancelar
                  </button>

                  <Button type="submit" variant="accent" loading={isSubmitting} disabled={name.trim() === ''} className="flex-1">
                    Salvar
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
