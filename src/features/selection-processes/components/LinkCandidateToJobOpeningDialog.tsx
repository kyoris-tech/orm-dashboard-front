'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { JobOpeningPicker } from '@/features/job-openings/components/JobOpeningPicker';

export interface LinkCandidateToJobOpeningDialogProps {
  isOpen: boolean;
  candidateName: string | null;
  isSubmitting?: boolean;
  onSubmit: (jobOpeningId: string) => void;
  onCancel: () => void;
}

export function LinkCandidateToJobOpeningDialog({
  isOpen,
  candidateName,
  isSubmitting,
  onSubmit,
  onCancel,
}: LinkCandidateToJobOpeningDialogProps) {
  const [jobOpeningId, setJobOpeningId] = useState('');
  const [wasOpen, setWasOpen] = useState(isOpen);

  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);

    if (isOpen) {
      setJobOpeningId('');
    }
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (jobOpeningId.trim() === '') {
      return;
    }

    onSubmit(jobOpeningId);
  }

  return (
    <Modal isOpen={isOpen} className="text-center">
      <h2 className="text-2xl font-semibold text-accent mb-2">Vincular a uma vaga</h2>
      <p className="text-sm text-muted mb-6">
        {candidateName ? (
          <>
            Escolha a vaga em que <span className="font-medium text-foreground">{candidateName}</span> vai entrar como
            candidato.
          </>
        ) : (
          'Escolha a vaga em que o candidato vai entrar.'
        )}
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6 items-center">
        <div className="w-full flex flex-col gap-2 text-left">
          <span className="text-sm font-medium text-foreground">Vaga</span>
          <JobOpeningPicker value={jobOpeningId} onChange={setJobOpeningId} />
        </div>

        <div className="flex gap-4 w-full">
          <SecondaryButton onClick={onCancel} className="flex-1">
            Cancelar
          </SecondaryButton>

          <Button type="submit" variant="accent" loading={isSubmitting} disabled={jobOpeningId.trim() === ''} className="flex-1 !w-auto">
            Vincular
          </Button>
        </div>
      </form>
    </Modal>
  );
}
