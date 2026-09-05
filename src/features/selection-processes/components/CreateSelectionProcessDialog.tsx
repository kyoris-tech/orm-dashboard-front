'use client';

import { useState } from 'react';
import { Briefcase } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { JobOpeningPicker } from '@/features/job-openings/components/JobOpeningPicker';

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
  const [wasOpen, setWasOpen] = useState(isOpen);

  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);

    if (isOpen) {
      setName('');
      setJobOpeningId('');
    }
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (name.trim() === '') {
      return;
    }

    onSubmit(name.trim(), jobOpeningId);
  }

  return (
    <Modal isOpen={isOpen} className="text-center">
      <h2 className="text-2xl font-semibold text-accent mb-2">Abrir processo seletivo</h2>
      <p className="text-muted text-sm mb-6">
        {candidateCount} candidato{candidateCount === 1 ? '' : 's'} selecionado{candidateCount === 1 ? '' : 's'}.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6 items-center">
        <Input
          label="Nome do processo"
          icon={Briefcase}
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          autoFocus
        />

        <div className="w-full flex flex-col gap-2 text-left">
          <span className="text-sm font-medium text-foreground">Vincular a uma vaga (opcional)</span>
          <JobOpeningPicker value={jobOpeningId} onChange={setJobOpeningId} />
        </div>

        <div className="flex gap-4 w-full">
          <SecondaryButton onClick={onCancel} className="flex-1">
            Cancelar
          </SecondaryButton>

          <Button type="submit" variant="accent" loading={isSubmitting} className="flex-1 !w-auto">
            Criar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
