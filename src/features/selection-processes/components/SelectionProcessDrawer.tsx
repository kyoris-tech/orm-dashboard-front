'use client';

import { useState } from 'react';
import { isAxiosError } from 'axios';
import { Briefcase, Loader2, User, XCircle } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { formatDate } from '@/lib/utils/date';
import { useSelectionProcessQuery } from '../hooks/use-selection-process-query';
import { useCancelSelectionProcessMutation } from '../hooks/use-cancel-selection-process-mutation';
import { useLinkJobOpeningMutation } from '../hooks/use-link-job-opening-mutation';
import { LinkJobOpeningDialog } from './LinkJobOpeningDialog';
import { ResumeModal } from '@/features/resumes/components/ResumeModal';
import type { ResumeListItem } from '@/types/resumes';

const DEFAULT_CANCEL_ERROR_MESSAGE = 'Não foi possível cancelar o processo seletivo.';

export interface SelectionProcessDrawerProps {
  processId: string | null;
  onClose: () => void;
}

export function SelectionProcessDrawer({ processId, onClose }: SelectionProcessDrawerProps) {
  const selectionProcessQuery = useSelectionProcessQuery(processId);
  const cancelSelectionProcessMutation = useCancelSelectionProcessMutation();
  const linkJobOpeningMutation = useLinkJobOpeningMutation();
  const [selectedResume, setSelectedResume] = useState<ResumeListItem | null>(null);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [isLinkJobOpen, setIsLinkJobOpen] = useState(false);

  const process = selectionProcessQuery.data;

  function handleConfirmCancel() {
    if (!processId) {
      return;
    }

    cancelSelectionProcessMutation.mutate(processId, {
      onSuccess: () => setIsCancelConfirmOpen(false),
    });
  }

  function handleLinkJobOpening(jobOpeningId: string) {
    if (!processId) {
      return;
    }

    linkJobOpeningMutation.mutate(
      { id: processId, jobOpeningId },
      {
        onSuccess: () => setIsLinkJobOpen(false),
      },
    );
  }

  const cancelErrorMessage = (() => {
    if (!cancelSelectionProcessMutation.isError) {
      return null;
    }

    const error = cancelSelectionProcessMutation.error;

    if (isAxiosError<{ message?: string }>(error)) {
      return error.response?.data?.message ?? DEFAULT_CANCEL_ERROR_MESSAGE;
    }

    return DEFAULT_CANCEL_ERROR_MESSAGE;
  })();

  return (
    <>
      <Drawer isOpen={Boolean(processId)} onClose={onClose} title={process?.name ?? 'Processo seletivo'}>
        {selectionProcessQuery.isLoading && (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="animate-spin text-accent" size={24} />
          </div>
        )}

        {selectionProcessQuery.isError && <p className="text-danger text-sm">Não foi possível carregar os candidatos deste processo.</p>}

        {process && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <Badge tone={process.status === 'OPEN' ? 'success' : 'neutral'}>{process.status === 'OPEN' ? 'Aberto' : 'Cancelado'}</Badge>
              <span className="text-xs text-muted">Criado em {formatDate(process.createdAt)}</span>
            </div>

            <button
              onClick={() => setIsLinkJobOpen(true)}
              className="flex items-center gap-2 text-sm border border-border rounded-xl px-4 py-3 hover:bg-surface-soft transition text-left"
            >
              <span className="bg-surface-soft text-accent rounded-full p-2 shrink-0">
                <Briefcase size={16} />
              </span>
              <span className="flex flex-col">
                <span className="text-foreground font-medium">{process.jobOpening ? process.jobOpening.title : 'Nenhuma vaga vinculada'}</span>
                <span className="text-xs text-accent">{process.jobOpening ? 'Alterar vaga' : 'Vincular vaga'}</span>
              </span>
            </button>

            <p className="text-sm text-muted">
              {process.candidates.length} candidato{process.candidates.length === 1 ? '' : 's'} neste processo.
            </p>

            <div className="flex flex-col gap-3">
              {process.candidates.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => setSelectedResume(entry.resume)}
                  className="flex items-center gap-3 text-left border border-border rounded-xl px-4 py-3 hover:bg-surface-soft transition"
                >
                  <span className="bg-surface-soft text-accent rounded-full p-2">
                    <User size={16} />
                  </span>
                  <span className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">{entry.resume.dataJson?.fullName ?? entry.resume.fullName}</span>
                    <span className="text-xs text-muted">Adicionado em {formatDate(entry.addedAt)}</span>
                  </span>
                </button>
              ))}
            </div>

            {process.status === 'OPEN' && (
              <button
                onClick={() => setIsCancelConfirmOpen(true)}
                className="mt-2 flex items-center justify-center gap-2 text-sm text-danger border border-danger/30 rounded-full py-2 hover:bg-danger-soft transition"
              >
                <XCircle size={16} />
                Cancelar processo seletivo
              </button>
            )}
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        isOpen={isCancelConfirmOpen}
        title="Cancelar processo seletivo"
        message={cancelErrorMessage ?? 'Isso encerra o processo seletivo. Os candidatos continuam disponíveis em Analisar Candidatos, mas o processo passa a ficar marcado como cancelado. Confirma?'}
        confirmLabel={cancelSelectionProcessMutation.isPending ? 'Cancelando...' : 'Cancelar processo'}
        cancelLabel="Voltar"
        onConfirm={handleConfirmCancel}
        onCancel={() => setIsCancelConfirmOpen(false)}
        tone="danger"
      />

      <LinkJobOpeningDialog
        isOpen={isLinkJobOpen}
        currentJobOpeningId={process?.jobOpening?.id}
        isSubmitting={linkJobOpeningMutation.isPending}
        onSubmit={handleLinkJobOpening}
        onCancel={() => setIsLinkJobOpen(false)}
      />

      <ResumeModal isOpen={Boolean(selectedResume)} onClose={() => setSelectedResume(null)} resume={selectedResume} />
    </>
  );
}
