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

export interface PlanFormDialogProps {
  isOpen: boolean;
  plan: Plan | null;
  isSubmitting?: boolean;
  onSubmit: (input: CreatePlanInput) => void;
  onCancel: () => void;
}

const EMPTY_FORM: CreatePlanInput = {
  name: '',
  maxUsers: null,
  maxResumesPerMonth: null,
  features: [],
};

function toFormValue(value: number | null): string {
  return value === null ? '' : String(value);
}

function toLimitValue(value: string): number | null {
  const trimmed = value.trim();

  if (trimmed === '') {
    return null;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : null;
}

export function PlanFormDialog({ isOpen, plan, isSubmitting, onSubmit, onCancel }: PlanFormDialogProps) {
  const formId = useId();
  const [form, setForm] = useState<CreatePlanInput>(EMPTY_FORM);
  const [baseline, setBaseline] = useState<CreatePlanInput>(EMPTY_FORM);
  const [wasOpen, setWasOpen] = useState(isOpen);

  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);

    if (isOpen) {
      const initial = plan
        ? { name: plan.name, maxUsers: plan.maxUsers, maxResumesPerMonth: plan.maxResumesPerMonth, features: plan.features }
        : EMPTY_FORM;
      setForm(initial);
      setBaseline(initial);
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

    if (form.name.trim() === '') {
      return;
    }

    onSubmit({ ...form, name: form.name.trim() });
  }

  const isDirty = !isSameValue(form, baseline);
  const { requestClose, discardDialog } = useDiscardGuard(isDirty, onCancel);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={requestClose}
        className="max-h-[90vh]"
        footer={
          <ModalActions
            formId={formId}
            submitLabel={'Salvar plano'}
            onCancel={requestClose}
            isSubmitting={isSubmitting}
            disabled={form.name.trim() === ''}
          />
        }
      >
        <h2 className="text-2xl font-semibold text-accent mb-6 text-center">{plan ? 'Editar plano' : 'Adicionar plano'}</h2>

        <form id={formId} onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Input
            label="Nome do plano"
            icon={Award}
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
              value={toFormValue(form.maxUsers)}
              onChange={(event) => setForm((current) => ({ ...current, maxUsers: toLimitValue(event.target.value) }))}
            />

            <Input
              label="Currículos/mês (vazio = ilimitado)"
              type="number"
              min={1}
              value={toFormValue(form.maxResumesPerMonth)}
              onChange={(event) => setForm((current) => ({ ...current, maxResumesPerMonth: toLimitValue(event.target.value) }))}
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
