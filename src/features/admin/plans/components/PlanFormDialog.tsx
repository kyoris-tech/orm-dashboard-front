'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Award } from 'lucide-react';
import { ModalPortal } from '@/components/ui/ModalPortal';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { Button } from '@/components/ui/Button';
import { FEATURE_OPTIONS } from '../../../plan/labels';
import type { CreatePlanInput, Plan, PlanFeature } from '@/types/company';

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
  const [form, setForm] = useState<CreatePlanInput>(EMPTY_FORM);
  const [wasOpen, setWasOpen] = useState(isOpen);

  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);

    if (isOpen) {
      setForm(
        plan
          ? { name: plan.name, maxUsers: plan.maxUsers, maxResumesPerMonth: plan.maxResumesPerMonth, features: plan.features }
          : EMPTY_FORM,
      );
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
              className="bg-surface rounded-2xl shadow-2xl w-full max-w-md p-8 max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-semibold text-accent mb-6 text-center">{plan ? 'Editar plano' : 'Adicionar plano'}</h2>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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

                <div className="flex gap-4 mt-2">
                  <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 px-6 py-2 rounded-full border border-border text-muted hover:bg-surface-soft transition font-medium"
                  >
                    Cancelar
                  </button>

                  <Button type="submit" variant="accent" loading={isSubmitting} disabled={form.name.trim() === ''} className="flex-1">
                    Salvar plano
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
