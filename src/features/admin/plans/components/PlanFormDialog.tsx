'use client';

import { useState, useId } from 'react';
import { Award } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { ModalActions } from '@/components/ui/ModalActions';
import { FEATURE_OPTIONS } from '../../../plan/labels';
import type { CreatePlanInput, Plan, PlanFeature } from '@/types/company';
import { useDiscardGuard } from '@/lib/hooks/use-discard-guard';
import { isSameValue } from '@/lib/utils/form';
import { useFormValidation } from '@/lib/validation/use-form-validation';
import { planFormSchema } from '../schemas';

export interface PlanFormDialogProps {
  isOpen: boolean;
  plan: Plan | null;
  isSubmitting?: boolean;
  onSubmit: (input: CreatePlanInput) => void;
  onCancel: () => void;
}

interface PlanFormValues {
  name: string;
  maxUsersText: string;
  maxResumesText: string;
  features: PlanFeature[];
}

const EMPTY_FORM: PlanFormValues = {
  name: '',
  maxUsersText: '',
  maxResumesText: '',
  features: [],
};

function limitToText(value: number | null): string {
  return value === null ? '' : String(value);
}

function textToLimit(value: string): number | null {
  const trimmed = value.trim();
  return trimmed === '' ? null : Number(trimmed);
}

function toFormValues(plan: Plan | null): PlanFormValues {
  if (!plan) {
    return EMPTY_FORM;
  }

  return {
    name: plan.name,
    maxUsersText: limitToText(plan.maxUsers),
    maxResumesText: limitToText(plan.maxResumesPerMonth),
    features: plan.features,
  };
}

export function PlanFormDialog({ isOpen, plan, isSubmitting, onSubmit, onCancel }: PlanFormDialogProps) {
  const formId = useId();
  const [form, setForm] = useState<PlanFormValues>(EMPTY_FORM);
  const [baseline, setBaseline] = useState<PlanFormValues>(EMPTY_FORM);
  const validation = useFormValidation(planFormSchema, form);
  const [wasOpen, setWasOpen] = useState(isOpen);

  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);

    if (isOpen) {
      const initial = toFormValues(plan);
      setForm(initial);
      setBaseline(initial);
      validation.reset();
    }
  }

  function toggleFeature(feature: PlanFeature) {
    setForm((current) => ({
      ...current,
      features: current.features.includes(feature) ? current.features.filter((item) => item !== feature) : [...current.features, feature],
    }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const data = validation.submit();

    if (!data) {
      return;
    }

    onSubmit({
      name: data.name,
      maxUsers: textToLimit(data.maxUsersText),
      maxResumesPerMonth: textToLimit(data.maxResumesText),
      features: data.features,
    });
  }

  const isDirty = !isSameValue(form, baseline);
  const { requestClose, discardDialog } = useDiscardGuard(isDirty, onCancel);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={requestClose}
        className="max-h-[90vh]"
        footer={<ModalActions formId={formId} submitLabel={'Salvar plano'} onCancel={requestClose} isSubmitting={isSubmitting} />}
      >
        <h2 className="text-2xl font-semibold text-accent mb-6 text-center">{plan ? 'Editar plano' : 'Adicionar plano'}</h2>

        <form id={formId} onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          <Input
            label="Nome do plano"
            icon={Award}
            {...validation.field('name')}
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            required
            autoFocus
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Máx. usuários (vazio = ilimitado)"
              type="number"
              min={1}
              value={form.maxUsersText}
              onChange={(event) => setForm((current) => ({ ...current, maxUsersText: event.target.value }))}
              {...validation.field('maxUsersText')}
            />

            <Input
              label="Currículos/mês (vazio = ilimitado)"
              type="number"
              min={1}
              value={form.maxResumesText}
              onChange={(event) => setForm((current) => ({ ...current, maxResumesText: event.target.value }))}
              {...validation.field('maxResumesText')}
            />
          </div>

          <div>
            <p className="text-sm text-muted mb-3">Funcionalidades incluídas</p>
            <div className="flex flex-col gap-3">
              {FEATURE_OPTIONS.map((option) => (
                <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                  <Checkbox checked={form.features.includes(option.value)} onChange={() => toggleFeature(option.value)} />
                  <span className="text-sm text-foreground">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </form>
      </Modal>
      {discardDialog}
    </>
  );
}
