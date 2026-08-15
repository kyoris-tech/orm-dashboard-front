'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Briefcase } from 'lucide-react';
import { ModalPortal } from '@/components/ui/ModalPortal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { TagListInput } from '@/components/ui/TagListInput';
import { Button } from '@/components/ui/Button';
import { CONTRACT_TYPE_OPTIONS, WORK_MODEL_OPTIONS } from '../labels';
import type { ContractType, CreateJobOpeningInput, WorkModel } from '@/types/job-opening';

export interface CreateJobOpeningDialogProps {
  isOpen: boolean;
  isSubmitting?: boolean;
  onSubmit: (input: CreateJobOpeningInput) => void;
  onCancel: () => void;
}

const EMPTY_FORM: CreateJobOpeningInput = {
  title: '',
  workModel: 'REMOTE',
  contractType: 'CLT',
  salaryRange: '',
  requirements: [],
  differentials: [],
};

export function CreateJobOpeningDialog({ isOpen, isSubmitting, onSubmit, onCancel }: CreateJobOpeningDialogProps) {
  const [form, setForm] = useState<CreateJobOpeningInput>(EMPTY_FORM);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (form.title.trim() === '') {
      return;
    }

    onSubmit({ ...form, title: form.title.trim(), salaryRange: form.salaryRange?.trim() || undefined });
    setForm(EMPTY_FORM);
  }

  function handleCancel() {
    setForm(EMPTY_FORM);
    onCancel();
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
              className="bg-surface rounded-2xl shadow-2xl w-full max-w-lg p-8 max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-semibold text-accent mb-6 text-center">Adicionar vaga</h2>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <Input
                  label="Título da vaga"
                  icon={Briefcase}
                  value={form.title}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                  required
                  autoFocus
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    options={WORK_MODEL_OPTIONS}
                    value={form.workModel}
                    onChange={(event) => setForm((current) => ({ ...current, workModel: event.target.value as WorkModel }))}
                  />

                  <Select
                    options={CONTRACT_TYPE_OPTIONS}
                    value={form.contractType}
                    onChange={(event) => setForm((current) => ({ ...current, contractType: event.target.value as ContractType }))}
                  />
                </div>

                <Input
                  label="Faixa salarial (opcional)"
                  icon={Briefcase}
                  value={form.salaryRange ?? ''}
                  onChange={(event) => setForm((current) => ({ ...current, salaryRange: event.target.value }))}
                />

                <TagListInput
                  label="Requisitos principais"
                  values={form.requirements}
                  onChange={(requirements) => setForm((current) => ({ ...current, requirements }))}
                  placeholder="Ex: 5+ anos com React"
                />

                <TagListInput
                  label="Diferenciais"
                  values={form.differentials}
                  onChange={(differentials) => setForm((current) => ({ ...current, differentials }))}
                  placeholder="Ex: Experiência com Design Systems"
                />

                <div className="flex gap-4 mt-2">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 px-6 py-2 rounded-full border border-border text-muted hover:bg-surface-soft transition font-medium"
                  >
                    Cancelar
                  </button>

                  <Button type="submit" variant="accent" loading={isSubmitting} className="flex-1">
                    Salvar vaga
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
