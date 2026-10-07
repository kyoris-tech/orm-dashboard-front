'use client';

import { useState } from 'react';
import { Briefcase } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { JobOpeningPicker } from '@/features/job-openings/components/JobOpeningPicker';
import { useDiscardGuard } from '@/lib/hooks/use-discard-guard';
import { useFormValidation } from '@/lib/validation/use-form-validation';
import { createSelectionProcessSchema } from '../schemas';

export interface CreateSelectionProcessDialogProps {
  isOpen: boolean;
  candidateCount: number;
  isSubmitting?: boolean;
  onSubmit: (name: string, jobOpeningId: string) => void;
  onCancel: () => void;
}

export function CreateSelectionProcessDialog({ isOpen, candidateCount, isSubmitting, onSubmit, onCancel }: CreateSelectionProcessDialogProps) {
  const [name, setName] = useState('');
  const [jobOpeningId, setJobOpeningId] = useState('');
  const validation = useFormValidation(createSelectionProcessSchema, { name, jobOpeningId });
  const [wasOpen, setWasOpen] = useState(isOpen);

  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);

    if (isOpen) {
      setName('');
      setJobOpeningId('');
      validation.reset();
    }
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const data = validation.submit();

    if (!data) {
      return;
    }

    onSubmit(data.name, data.jobOpeningId);
  }

  const isDirty = name !== '' || jobOpeningId !== '';
  const { requestClose, discardDialog } = useDiscardGuard(isDirty, onCancel);

  return (
    <>
      <Modal isOpen={isOpen} onClose={requestClose} className="text-center">
        <h2 className="text-2xl font-semibold text-accent mb-2">Abrir processo seletivo</h2>
        <p className="text-muted text-sm mb-6">
          {candidateCount} candidato{candidateCount === 1 ? '' : 's'} selecionado{candidateCount === 1 ? '' : 's'}.
        </p>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6 items-center">
          <Input
            label="Nome do processo"
            icon={Briefcase}
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            autoFocus
            {...validation.field('name')}
          />

          <div className="w-full flex flex-col gap-2 text-left">
            <span className="text-sm font-medium text-foreground">Vincular a uma vaga (opcional)</span>
            <JobOpeningPicker value={jobOpeningId} onChange={setJobOpeningId} />
          </div>

          <div className="flex gap-4 w-full">
            <SecondaryButton onClick={requestClose} className="flex-1">
              Cancelar
            </SecondaryButton>

            <Button type="submit" variant="accent" loading={isSubmitting} className="flex-1 !w-auto">
              Criar
            </Button>
          </div>
        </form>
      </Modal>
      {discardDialog}
    </>
  );
}
