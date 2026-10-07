'use client';

import { useState, useId } from 'react';
import { Briefcase } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { Select } from '@/components/ui/Select';
import { TagListInput } from '@/components/ui/TagListInput';
import { ModalActions } from '@/components/ui/ModalActions';
import { formatSalaryRange } from '@/lib/utils/currency';
import { CONTRACT_TYPE_OPTIONS, WORK_MODEL_OPTIONS } from '../labels';
import { JobOpeningVisibilityPicker } from './JobOpeningVisibilityPicker';
import type { ContractType, JobOpeningDetail, CreateJobOpeningInput, WorkModel } from '@/types/job-opening';
import { useDiscardGuard } from '@/lib/hooks/use-discard-guard';
import { isSameValue } from '@/lib/utils/form';
import { useFormValidation } from '@/lib/validation/use-form-validation';
import { jobOpeningFormSchema } from '../schemas';

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
  visibility: 'PUBLIC',
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
    visibility: jobOpening.visibility,
    salaryRange: jobOpening.salaryRange ?? undefined,
    requirements: jobOpening.requirements,
    differentials: jobOpening.differentials,
    benefits: jobOpening.benefits,
  };
}

export function JobOpeningFormDialog({ isOpen, jobOpening, isSubmitting, onSubmit, onCancel }: JobOpeningFormDialogProps) {
  const formId = useId();
  const isEditing = Boolean(jobOpening);
  const [form, setForm] = useState<CreateJobOpeningInput>(() => toFormState(jobOpening));
  const [salaryMin, setSalaryMin] = useState<number | undefined>(undefined);
  const [salaryMax, setSalaryMax] = useState<number | undefined>(undefined);
  const [baseline, setBaseline] = useState<CreateJobOpeningInput>(() => toFormState(jobOpening));
  const validation = useFormValidation(jobOpeningFormSchema, { ...form, salaryMin, salaryMax });
  const [wasOpen, setWasOpen] = useState(isOpen);

  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);

    if (isOpen) {
      const initial = toFormState(jobOpening);
      setForm(initial);
      setBaseline(initial);
      setSalaryMin(undefined);
      setSalaryMax(undefined);
      validation.reset();
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

    const data = validation.submit();

    if (!data) {
      return;
    }

    const newSalaryRange = formatSalaryRange(data.salaryMin, data.salaryMax);

    onSubmit({
      ...form,
      title: data.title,
      salaryRange: newSalaryRange ?? form.salaryRange,
    });

    if (!isEditing) {
      setForm(EMPTY_FORM);
      setSalaryMin(undefined);
      setSalaryMax(undefined);
    }
  }

  const isDirty = !isSameValue(form, baseline) || salaryMin !== undefined || salaryMax !== undefined;
  const { requestClose, discardDialog } = useDiscardGuard(isDirty, resetAndClose);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={requestClose}
        size="lg"
        className="max-h-[90vh]"
        footer={
          <ModalActions
            formId={formId}
            submitLabel={isEditing ? 'Salvar alterações' : 'Salvar vaga'}
            onCancel={requestClose}
            isSubmitting={isSubmitting}
          />
        }
      >
        <h2 className="text-2xl font-semibold text-accent mb-6 text-center">{isEditing ? 'Editar vaga' : 'Adicionar vaga'}</h2>

        <form id={formId} onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          <Input
            label="Título da vaga"
            icon={Briefcase}
            {...validation.field('title')}
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

          <JobOpeningVisibilityPicker value={form.visibility} onChange={(visibility) => setForm((current) => ({ ...current, visibility }))} />

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
              {...validation.field('salaryMin')}
            />

            <CurrencyInput
              label={isEditing ? 'Novo salário máximo (opcional)' : 'Salário máximo (opcional)'}
              value={salaryMax}
              onValueChange={setSalaryMax}
              {...validation.field('salaryMax')}
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
        </form>
      </Modal>
      {discardDialog}
    </>
  );
}
