'use client';

import { useState } from 'react';
import { Building2, Mail, MapPin, Phone, Globe, Briefcase, User, CalendarClock } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { CnpjInput } from '@/components/ui/CnpjInput';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { usePlansQuery } from '../../plans/hooks/use-plans-query';
import type { CreateCompanyInput } from '@/types/company';
import { ALL_ITEMS_PAGE_SIZE } from '@/types/pagination';

export interface CreateCompanyDialogProps {
  isOpen: boolean;
  isSubmitting?: boolean;
  onSubmit: (input: CreateCompanyInput) => void;
  onCancel: () => void;
}

const EMPTY_FORM: CreateCompanyInput = {
  name: '',
  email: '',
  cnpj: '',
  planId: '',
  phone: '',
  address: '',
  website: '',
  segment: '',
  contactName: '',
};

export function CreateCompanyDialog({ isOpen, isSubmitting, onSubmit, onCancel }: CreateCompanyDialogProps) {
  const plansQuery = usePlansQuery({ pageSize: ALL_ITEMS_PAGE_SIZE });
  const [form, setForm] = useState<CreateCompanyInput>(EMPTY_FORM);
  const [billingDayText, setBillingDayText] = useState('');
  const [wasOpen, setWasOpen] = useState(isOpen);

  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);

    if (isOpen) {
      setForm(EMPTY_FORM);
      setBillingDayText('');
    }
  }

  const planOptions = (plansQuery.data?.data ?? []).map((plan) => ({ value: plan.id, label: plan.name }));

  const isFormValid = form.name.trim() !== '' && form.email.trim() !== '' && form.cnpj.trim() !== '' && form.planId !== '';

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!isFormValid) {
      return;
    }

    const billingDay = billingDayText.trim() === '' ? undefined : Number(billingDayText);

    onSubmit({ ...form, name: form.name.trim(), email: form.email.trim(), billingDay });
  }

  return (
    <Modal isOpen={isOpen} size="lg" className="max-h-[90vh] overflow-y-auto">
      <h2 className="text-2xl font-semibold text-accent mb-6 text-center">Adicionar empresa</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Input
          label="Nome da empresa"
          icon={Building2}
          value={form.name}
          onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          required
          autoFocus
        />

        <Input
          label="E-mail"
          icon={Mail}
          type="email"
          value={form.email}
          onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CnpjInput
            label="CNPJ"
            value={form.cnpj}
            onValueChange={(value) => setForm((current) => ({ ...current, cnpj: value }))}
            required
          />

          <Select
            options={planOptions}
            placeholder={plansQuery.isLoading ? 'Carregando planos...' : 'Selecione o plano'}
            value={form.planId}
            onChange={(event) => setForm((current) => ({ ...current, planId: event.target.value }))}
            disabled={plansQuery.isLoading || planOptions.length === 0}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Telefone (opcional)"
            icon={Phone}
            value={form.phone}
            onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
          />

          <Input
            label="Site (opcional)"
            icon={Globe}
            value={form.website}
            onChange={(event) => setForm((current) => ({ ...current, website: event.target.value }))}
          />
        </div>

        <Input
          label="Endereço (opcional)"
          icon={MapPin}
          value={form.address}
          onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Segmento (opcional)"
            icon={Briefcase}
            value={form.segment}
            onChange={(event) => setForm((current) => ({ ...current, segment: event.target.value }))}
          />

          <Input
            label="Responsável (opcional)"
            icon={User}
            value={form.contactName}
            onChange={(event) => setForm((current) => ({ ...current, contactName: event.target.value }))}
          />
        </div>

        <Input
          label="Dia de cobrança (1-31, opcional)"
          icon={CalendarClock}
          type="number"
          min={1}
          max={31}
          value={billingDayText}
          onChange={(event) => setBillingDayText(event.target.value)}
        />

        <div className="flex gap-4 mt-2">
          <SecondaryButton onClick={onCancel} className="flex-1">
            Cancelar
          </SecondaryButton>

          <Button type="submit" variant="accent" loading={isSubmitting} disabled={!isFormValid} className="flex-1">
            Salvar empresa
          </Button>
        </div>
      </form>
    </Modal>
  );
}
