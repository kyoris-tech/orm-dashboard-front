'use client';

import { useState } from 'react';
import { Trophy } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Radio } from '@/components/ui/Radio';
import { Button } from '@/components/ui/Button';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import type { SelectionProcessCandidateEntry } from '@/types/selection-process';

export interface ConcludeSelectionProcessDialogProps {
  isOpen: boolean;
  candidates: SelectionProcessCandidateEntry[];
  isSubmitting?: boolean;
  onSubmit: (resumeId: string) => void;
  onCancel: () => void;
}

export function ConcludeSelectionProcessDialog({
  isOpen,
  candidates,
  isSubmitting,
  onSubmit,
  onCancel,
}: ConcludeSelectionProcessDialogProps) {
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [wasOpen, setWasOpen] = useState(isOpen);

  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);

    if (isOpen) {
      setSelectedResumeId(null);
    }
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!selectedResumeId) {
      return;
    }

    onSubmit(selectedResumeId);
  }

  return (
    <Modal isOpen={isOpen} className="flex flex-col max-h-[85vh]">
      <h2 className="text-2xl font-semibold text-accent mb-2 text-center">Concluir processo seletivo</h2>
      <p className="text-sm text-muted text-center mb-6">Selecione o candidato escolhido para esta vaga.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 flex-1 min-h-0">
        <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2 border border-border rounded-xl p-2">
          {candidates.length === 0 && <p className="text-muted text-sm text-center py-6">Nenhum candidato neste processo.</p>}

          {candidates.map((entry) => {
            const name = entry.resume.dataJson?.fullName ?? entry.resume.fullName;

            return (
              <label
                key={entry.id}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-soft transition cursor-pointer"
              >
                <Radio
                  name="selected-candidate"
                  checked={selectedResumeId === entry.resumeId}
                  onChange={() => setSelectedResumeId(entry.resumeId)}
                />
                <span className="text-sm text-foreground">{name}</span>
              </label>
            );
          })}
        </div>

        <div className="flex gap-4">
          <SecondaryButton onClick={onCancel} className="flex-1">
            Cancelar
          </SecondaryButton>

          <Button
            type="submit"
            variant="accent"
            loading={isSubmitting}
            disabled={!selectedResumeId}
            className="flex-1 !w-auto flex items-center justify-center gap-2"
          >
            <Trophy size={16} />
            Concluir
          </Button>
        </div>
      </form>
    </Modal>
  );
}
