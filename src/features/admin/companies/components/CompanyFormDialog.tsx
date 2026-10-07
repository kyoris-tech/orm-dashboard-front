'use client';

import { useState, useId } from 'react';
import { Building2, Mail, MapPin, Phone, Globe, Briefcase, User, CalendarClock } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { CnpjInput } from '@/components/ui/CnpjInput';
import { Select } from '@/components/ui/Select';
import { ModalActions } from '@/components/ui/ModalActions';
import { usePlansQuery } from '../../plans/hooks/use-plans-query';
import type { CompanySummary, CreateCompanyInput, UpdateCompanyInput } from '@/types/company';
import { ALL_ITEMS_PAGE_SIZE } from '@/types/pagination';
import { useDiscardGuard } from '@/lib/hooks/use-discard-guard';
import { isSameValue } from '@/lib/utils/form';

interface CompanyFormBaseProps {
  isOpen: boolean;
  isSubmitting?: boolean;
  onCancel: () => void;
}

interface CompanyCreateProps extends CompanyFormBaseProps {
  mode: 'create';
  onSubmit: (input: CreateCompanyInput) => void;
}

interface CompanyEditProps extends CompanyFormBaseProps {
  mode: 'edit';
  company: CompanySummary | null;
  onSubmit: (input: UpdateCompanyInput) => void;
}

export type CompanyFormDialogProps = CompanyCreateProps | CompanyEditProps;

interface CompanyFormValues {
  name: string;
  email: string;
  cnpj: string;
  planId: string;
  phone: string;
  address: string;
  website: string;
  segment: string;
  contactName: string;
}

const EMPTY_FORM: CompanyFormValues = {
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

function toFormValues(company: CompanySummary): CompanyFormValues {
  return {
    name: company.name,
    email: '',
    cnpj: company.cnpj ?? '',
    planId: company.planId,
    phone: company.phone ?? '',
    address: company.address ?? '',
    website: company.website ?? '',
    segment: company.segment ?? '',
    contactName: company.contactName ?? '',
  };
}

export function CompanyFormDialog(props: CompanyFormDialogProps) {
  const formId = useId();
  const { isOpen, isSubmitting, onCancel } = props;
  const isEditing = props.mode === 'edit';
  const company = props.mode === 'edit' ? props.company : null;

  const plansQuery = usePlansQuery({ pageSize: ALL_ITEMS_PAGE_SIZE });
  const [form, setForm] = useState<CompanyFormValues>(EMPTY_FORM);
  const [billingDayText, setBillingDayText] = useState('');
  const [baseline, setBaseline] = useState({ form: EMPTY_FORM, billingDayText: '' });
  const [wasOpen, setWasOpen] = useState(isOpen);

  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);

    if (isOpen && (!isEditing || company)) {
      const initialForm = company ? toFormValues(company) : EMPTY_FORM;
      const initialBillingDay = company?.billingDay == null ? '' : String(company.billingDay);
      setForm(initialForm);
      setBillingDayText(initialBillingDay);
      setBaseline({ form: initialForm, billingDayText: initialBillingDay });
    }
  }

  const planOptions = (plansQuery.data?.data ?? []).map((plan) => ({ value: plan.id, label: plan.name }));

  const isFormValid = isEditing
    ? form.name.trim() !== ''
    : form.name.trim() !== '' && form.email.trim() !== '' && form.cnpj.trim() !== '' && form.planId !== '';

  function updateField(field: keyof CompanyFormValues, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!isFormValid) {
      return;
    }

    const trimmedName = form.name.trim();

    if (props.mode === 'edit') {
      const billingDay = billingDayText.trim() === '' ? null : Number(billingDayText);
      props.onSubmit({
        name: trimmedName,
        cnpj: form.cnpj,
        planId: form.planId,
        phone: form.phone,
        address: form.address,
        website: form.website,
        segment: form.segment,
        contactName: form.contactName,
        billingDay,
      });
      return;
    }

    const billingDay = billingDayText.trim() === '' ? undefined : Number(billingDayText);
    props.onSubmit({ ...form, name: trimmedName, email: form.email.trim(), billingDay });
  }

  const isDirty = !isSameValue({ form, billingDayText }, baseline);
  const { requestClose, discardDialog } = useDiscardGuard(isDirty, onCancel);

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
            submitLabel={isEditing ? 'Salvar' : 'Salvar empresa'}
            onCancel={requestClose}
            isSubmitting={isSubmitting}
            disabled={!isFormValid}
          />
        }
      >
        <h2 className="text-2xl font-semibold text-accent mb-6 text-center">{isEditing ? 'Editar empresa' : 'Adicionar empresa'}</h2>

        <form id={formId} onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Input
            label="Nome da empresa"
            icon={Building2}
            value={form.name}
            onChange={(event) => updateField('name', event.target.value)}
            required
            autoFocus
          />

          {!isEditing && (
            <Input
              label="E-mail"
              icon={Mail}
              type="email"
              value={form.email}
              onChange={(event) => updateField('email', event.target.value)}
              required
            />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CnpjInput label="CNPJ" value={form.cnpj} onValueChange={(value) => updateField('cnpj', value)} required={!isEditing} />

            <Select
              options={planOptions}
              placeholder={plansQuery.isLoading ? 'Carregando planos...' : 'Selecione o plano'}
              value={form.planId}
              onChange={(event) => updateField('planId', event.target.value)}
              disabled={plansQuery.isLoading || (!isEditing && planOptions.length === 0)}
              required={!isEditing}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Telefone (opcional)" icon={Phone} value={form.phone} onChange={(event) => updateField('phone', event.target.value)} />

            <Input label="Site (opcional)" icon={Globe} value={form.website} onChange={(event) => updateField('website', event.target.value)} />
          </div>

          <Input label="Endereço (opcional)" icon={MapPin} value={form.address} onChange={(event) => updateField('address', event.target.value)} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Segmento (opcional)"
              icon={Briefcase}
              value={form.segment}
              onChange={(event) => updateField('segment', event.target.value)}
            />

            <Input
              label="Responsável (opcional)"
              icon={User}
              value={form.contactName}
              onChange={(event) => updateField('contactName', event.target.value)}
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
        </form>
      </Modal>
      {discardDialog}
    </>
  );
}
