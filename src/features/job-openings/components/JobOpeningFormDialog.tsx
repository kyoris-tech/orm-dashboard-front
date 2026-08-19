'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Briefcase } from 'lucide-react';
import { ModalPortal } from '@/components/ui/ModalPortal';
import { Input } from '@/components/ui/Input';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { Select } from '@/components/ui/Select';
import { TagListInput } from '@/components/ui/TagListInput';
import { Button } from '@/components/ui/Button';
import { formatSalaryRange } from '@/lib/utils/currency';
import { CONTRACT_TYPE_OPTIONS, WORK_MODEL_OPTIONS } from '../labels';
import type { ContractType, JobOpeningDetail, CreateJobOpeningInput, WorkModel } from '@/types/job-opening';

export interface JobOpeningFormDialogProps {
  isOpen: boolean;
  jobOpening: JobOpeningDetail | null;
  isSubmitting?: boolean;
  onSubmit: (input: CreateJobOpeningInput) => void;
  onCancel: () => void;
}

const EMPTY_FORM: CreateJobOpeningInput = {
  title: '',
  workModel: 'REMOTE',
  contractType: 'CLT',
  requirements: [],
  differentials: [],
  benefits: [],
};

function toFormState(jobOpening: JobOpeningDetail | null): CreateJobOpeningInput {
  if (!jobOpening) {
    return EMPTY_FORM;
  }

  return {
    title: jobOpening.title,
    workModel: jobOpening.workModel,
    contractType: jobOpening.contractType,
    salaryRange: jobOpening.salaryRange ?? undefined,
    requirements: jobOpening.requirements,
    differentials: jobOpening.differentials,
    benefits: jobOpening.benefits,
  };
}

export function JobOpeningFormDialog({ isOpen, jobOpening, isSubmitting, onSubmit, onCancel }: JobOpeningFormDialogProps) {
  const isEditing = Boolean(jobOpening);
  const [form, setForm] = useState<CreateJobOpeningInput>(() => toFormState(jobOpening));
  const [salaryMin, setSalaryMin] = useState<number | undefined>(undefined);
  const [salaryMax, setSalaryMax] = useState<number | undefined>(undefined);
  const [wasOpen, setWasOpen] = useState(isOpen);

  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);

    if (isOpen) {
      setForm(toFormState(jobOpening));
      setSalaryMin(undefined);
      setSalaryMax(undefined);
    }
  }

  function resetAndClose() {
    setForm(EMPTY_FORM);
    setSalaryMin(undefined);
    setSalaryMax(undefined);
    onCancel();
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (form.title.trim() === '') {
      return;
    }

    const newSalaryRange = formatSalaryRange(salaryMin, salaryMax);

    onSubmit({
      ...form,
      title: form.title.trim(),
      salaryRange: newSalaryRange ?? form.salaryRange,
    });

    if (!isEditing) {
      setForm(EMPTY_FORM);
      setSalaryMin(undefined);
      setSalaryMax(undefined);
    }
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
              <h2 className="text-2xl font-semibold text-accent mb-6 text-center">{isEditing ? 'Editar vaga' : 'Adicionar vaga'}</h2>

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

                {isEditing && form.salaryRange && (
                  <p className="text-xs text-muted -mb-2">
                    Faixa salarial atual: <span className="font-medium text-foreground">{form.salaryRange}</span> — preencha abaixo só se quiser substituir.
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <CurrencyInput
                    label={isEditing ? 'Novo salário mínimo (opcional)' : 'Salário mínimo (opcional)'}
                    value={salaryMin}
                    onValueChange={setSalaryMin}
                  />

                  <CurrencyInput
                    label={isEditing ? 'Novo salário máximo (opcional)' : 'Salário máximo (opcional)'}
                    value={salaryMax}
                    onValueChange={setSalaryMax}
                  />
                </div>

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

                <TagListInput
                  label="Benefícios"
                  values={form.benefits}
                  onChange={(benefits) => setForm((current) => ({ ...current, benefits }))}
                  placeholder="Ex: Vale-refeição, plano de saúde"
                />

                <div className="flex gap-4 mt-2">
                  <button
                    type="button"
                    onClick={resetAndClose}
                    className="flex-1 px-6 py-2 rounded-full border border-border text-muted hover:bg-surface-soft transition font-medium"
                  >
                    Cancelar
                  </button>

                  <Button type="submit" variant="accent" loading={isSubmitting} className="flex-1">
                    {isEditing ? 'Salvar alterações' : 'Salvar vaga'}
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
