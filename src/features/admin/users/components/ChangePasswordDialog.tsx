'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Button } from '@/components/ui/Button';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import type { UserSummary } from '@/types/user';
import { useDiscardGuard } from '@/lib/hooks/use-discard-guard';
import { useFormValidation } from '@/lib/validation/use-form-validation';
import { changePasswordSchema } from '../schemas';

export interface ChangePasswordDialogProps {
  isOpen: boolean;
  user: UserSummary | null;
  isSubmitting?: boolean;
  onSubmit: (password: string) => void;
  onCancel: () => void;
}

export function ChangePasswordDialog({ isOpen, user, isSubmitting, onSubmit, onCancel }: ChangePasswordDialogProps) {
  const [password, setPassword] = useState('');
  const validation = useFormValidation(changePasswordSchema, { password });
  const [wasOpen, setWasOpen] = useState(isOpen);

  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);

    if (isOpen) {
      setPassword('');
      validation.reset();
    }
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const data = validation.submit();

    if (!data) {
      return;
    }

    onSubmit(data.password);
  }

  const isDirty = password !== '';
  const { requestClose, discardDialog } = useDiscardGuard(isDirty, onCancel);

  return (
    <>
      <Modal isOpen={isOpen} onClose={requestClose}>
        <h2 className="text-2xl font-semibold text-accent mb-2 text-center">Alterar senha</h2>
        <p className="text-sm text-muted text-center mb-6">
          Defina uma nova senha para <span className="font-medium text-foreground">{user?.name}</span>.
        </p>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          <PasswordInput
            label="Nova senha (mínimo 6 caracteres)"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            {...validation.field('password')}
            autoComplete="new-password"
            autoFocus
          />

          <div className="flex gap-4 mt-2">
            <SecondaryButton onClick={requestClose} className="flex-1">
              Cancelar
            </SecondaryButton>

            <Button type="submit" variant="accent" loading={isSubmitting} className="flex-1">
              Salvar senha
            </Button>
          </div>
        </form>
      </Modal>
      {discardDialog}
    </>
  );
}
