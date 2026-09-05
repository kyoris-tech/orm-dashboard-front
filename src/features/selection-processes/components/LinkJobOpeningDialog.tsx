'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { JobOpeningPicker } from '@/features/job-openings/components/JobOpeningPicker';

export interface LinkJobOpeningDialogProps {
  isOpen: boolean;
  currentJobOpeningId?: string | null;
  isSubmitting?: boolean;
  onSubmit: (jobOpeningId: string) => void;
  onCancel: () => void;
}

export function LinkJobOpeningDialog({ isOpen, currentJobOpeningId, isSubmitting, onSubmit, onCancel }: LinkJobOpeningDialogProps) {
  const [jobOpeningId, setJobOpeningId] = useState(currentJobOpeningId ?? '');
  const [wasOpen, setWasOpen] = useState(isOpen);

  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);

    if (isOpen) {
      setJobOpeningId(currentJobOpeningId ?? '');
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
      <h2 className="text-2xl font-semibold text-accent mb-6">Vincular vaga</h2>

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
