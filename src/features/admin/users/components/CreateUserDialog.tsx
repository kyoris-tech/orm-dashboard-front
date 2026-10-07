'use client';

import { useMemo, useState, useId } from 'react';
import { Mail, User } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Select } from '@/components/ui/Select';
import { ModalActions } from '@/components/ui/ModalActions';
import { useCompaniesQuery } from '../../companies/hooks/use-companies-query';
import { ROLE_OPTIONS } from '../labels';
import type { CreateUserInput } from '@/types/user';
import type { RoleName } from '@/types/domain';
import { ALL_ITEMS_PAGE_SIZE } from '@/types/pagination';
import { useDiscardGuard } from '@/lib/hooks/use-discard-guard';
import { isSameValue } from '@/lib/utils/form';
import { useFormValidation } from '@/lib/validation/use-form-validation';
import { createUserSchema } from '../schemas';

export interface CreateUserDialogProps {
  isOpen: boolean;
  isSubmitting?: boolean;
  onSubmit: (input: CreateUserInput) => void;
  onCancel: () => void;
}

const EMPTY_FORM: CreateUserInput = {
  name: '',
  email: '',
  password: '',
  companyId: '',
  role: 'recruiter',
};

export function CreateUserDialog({ isOpen, isSubmitting, onSubmit, onCancel }: CreateUserDialogProps) {
  const formId = useId();
  const companiesQuery = useCompaniesQuery({ pageSize: ALL_ITEMS_PAGE_SIZE });
  const [form, setForm] = useState<CreateUserInput>(EMPTY_FORM);
  const validation = useFormValidation(createUserSchema, form);
  const [wasOpen, setWasOpen] = useState(isOpen);

  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);

    if (isOpen) {
      setForm(EMPTY_FORM);
      validation.reset();
    }
  }

  const companyOptions = useMemo(
    () =>
      (companiesQuery.data?.data ?? [])
        .filter((company) => company.status !== 'DELETED')
        .map((company) => ({ value: company.id, label: company.name })),
    [companiesQuery.data],
  );

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const data = validation.submit();

    if (!data) {
      return;
    }

    onSubmit(data);
  }

  const isDirty = !isSameValue(form, EMPTY_FORM);
  const { requestClose, discardDialog } = useDiscardGuard(isDirty, onCancel);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={requestClose}
        className="max-h-[90vh]"
        footer={<ModalActions formId={formId} submitLabel={'Salvar usuário'} onCancel={requestClose} isSubmitting={isSubmitting} />}
      >
        <h2 className="text-2xl font-semibold text-accent mb-6 text-center">Adicionar usuário</h2>

        <form id={formId} onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          <Input
            label="Nome"
            icon={User}
            {...validation.field('name')}
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            required
            autoFocus
          />

          <Input
            label="E-mail"
            icon={Mail}
            type="email"
            {...validation.field('email')}
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            required
          />

          <PasswordInput
            label="Senha (mínimo 6 caracteres)"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            required
            {...validation.field('password')}
            autoComplete="new-password"
          />

          <Select
            options={companyOptions}
            placeholder={companiesQuery.isLoading ? 'Carregando empresas...' : 'Selecione a empresa'}
            value={form.companyId}
            onChange={(event) => setForm((current) => ({ ...current, companyId: event.target.value }))}
            disabled={companiesQuery.isLoading || companyOptions.length === 0}
            required
            {...validation.field('companyId')}
          />

          <Select
            options={ROLE_OPTIONS}
            value={form.role}
            onChange={(event) => setForm((current) => ({ ...current, role: event.target.value as RoleName }))}
          />
        </form>
      </Modal>
      {discardDialog}
    </>
  );
}
