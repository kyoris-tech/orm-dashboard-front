'use client';

import { useState } from 'react';
import { isAxiosError } from 'axios';
import { Briefcase, Loader2, Trophy, UserPlus, User, XCircle } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Toast } from '@/components/ui/Toast';
import { formatDate } from '@/lib/utils/date';
import { useSelectionProcessQuery } from '../hooks/use-selection-process-query';
import { useCancelSelectionProcessMutation } from '../hooks/use-cancel-selection-process-mutation';
import { useCloseSelectionProcessMutation } from '../hooks/use-close-selection-process-mutation';
import { useConcludeSelectionProcessMutation } from '../hooks/use-conclude-selection-process-mutation';
import { useLinkJobOpeningMutation } from '../hooks/use-link-job-opening-mutation';
import { useAddCandidatesMutation } from '../hooks/use-add-candidates-mutation';
import { LinkJobOpeningDialog } from './LinkJobOpeningDialog';
import { AddCandidatesDialog } from './AddCandidatesDialog';
import { ConcludeSelectionProcessDialog } from './ConcludeSelectionProcessDialog';
import { SELECTION_PROCESS_STATUS_LABELS, SELECTION_PROCESS_STATUS_TONES } from '../labels';
import { JOB_OPENING_STATUS_LABELS, JOB_OPENING_STATUS_TONES } from '@/features/job-openings/labels';
import { ResumeModal } from '@/features/resumes/components/ResumeModal';
import type { ResumeListItem } from '@/types/resumes';

const DEFAULT_ERROR_MESSAGE = 'Não foi possível concluir esta ação.';

function matchScoreTone(value: number): string {
  if (value > 80) return 'bg-success';
  if (value >= 60) return 'bg-accent';
  if (value >= 30) return 'bg-[#FFD600] !text-[#001B30]';
  return 'bg-border !text-muted';
}

function extractErrorMessage(error: unknown): string {
  if (isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? DEFAULT_ERROR_MESSAGE;
  }

  return DEFAULT_ERROR_MESSAGE;
}

export interface SelectionProcessDrawerProps {
  processId: string | null;
  onClose: () => void;
}

export function SelectionProcessDrawer({ processId, onClose }: SelectionProcessDrawerProps) {
  const selectionProcessQuery = useSelectionProcessQuery(processId);
  const cancelSelectionProcessMutation = useCancelSelectionProcessMutation();
  const closeSelectionProcessMutation = useCloseSelectionProcessMutation();
  const concludeSelectionProcessMutation = useConcludeSelectionProcessMutation();
  const linkJobOpeningMutation = useLinkJobOpeningMutation();
  const addCandidatesMutation = useAddCandidatesMutation();
  const [selectedResume, setSelectedResume] = useState<ResumeListItem | null>(null);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [isCloseConfirmOpen, setIsCloseConfirmOpen] = useState(false);
  const [isLinkJobOpen, setIsLinkJobOpen] = useState(false);
  const [isAddCandidatesOpen, setIsAddCandidatesOpen] = useState(false);
  const [isConcludeOpen, setIsConcludeOpen] = useState(false);
  const [actionErrorMessage, setActionErrorMessage] = useState<string | null>(null);

  const process = selectionProcessQuery.data;

  function handleConfirmCancel() {
    if (!processId) {
      return;
    }

    cancelSelectionProcessMutation.mutate(processId, {
      onSuccess: () => setIsCancelConfirmOpen(false),
      onError: (error) => setActionErrorMessage(extractErrorMessage(error)),
    });
  }

  function handleConfirmClose() {
    if (!processId) {
      return;
    }

    closeSelectionProcessMutation.mutate(processId, {
      onSuccess: () => setIsCloseConfirmOpen(false),
      onError: (error) => setActionErrorMessage(extractErrorMessage(error)),
    });
  }

  function handleConclude(resumeId: string) {
    if (!processId) {
      return;
    }

    concludeSelectionProcessMutation.mutate(
      { id: processId, resumeId },
      {
        onSuccess: () => setIsConcludeOpen(false),
        onError: (error) => setActionErrorMessage(extractErrorMessage(error)),
      },
    );
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

  function handleAddCandidates(resumeIds: string[]) {
    if (!processId) {
      return;
    }

    addCandidatesMutation.mutate(
      { id: processId, resumeIds },
      {
        onSuccess: () => setIsAddCandidatesOpen(false),
      },
    );
  }

  const isOpenStatus = process?.status === 'OPEN';
  const selectedResumeName = process?.selectedResume?.dataJson?.fullName ?? process?.selectedResume?.fullName;

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
              <Badge tone={SELECTION_PROCESS_STATUS_TONES[process.status]}>{SELECTION_PROCESS_STATUS_LABELS[process.status]}</Badge>
              <span className="text-xs text-muted">Criado em {formatDate(process.createdAt)}</span>
            </div>

            {process.status === 'CONCLUDED' && selectedResumeName && (
              <div className="flex items-center gap-3 border border-accent/30 bg-accent/5 rounded-xl px-4 py-3">
                <span className="bg-accent/10 text-accent rounded-full p-2 shrink-0">
                  <Trophy size={16} />
                </span>
                <span className="flex flex-col">
                  <span className="text-xs text-muted">Candidato escolhido</span>
                  <span className="text-sm font-medium text-foreground">{selectedResumeName}</span>
                  {process.concludedAt && <span className="text-xs text-muted">Concluído em {formatDate(process.concludedAt)}</span>}
                </span>
              </div>
            )}

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

              {process.jobOpening && (
                <Badge tone={JOB_OPENING_STATUS_TONES[process.jobOpening.status]} className="ml-auto">
                  {JOB_OPENING_STATUS_LABELS[process.jobOpening.status]}
                </Badge>
              )}
            </button>

            <div className="flex items-center justify-between">
              <p className="text-sm text-muted">
                {process.candidates.length} candidato{process.candidates.length === 1 ? '' : 's'} neste processo.
              </p>

              {isOpenStatus && (
                <button
                  onClick={() => setIsAddCandidatesOpen(true)}
                  className="flex items-center gap-1 text-xs font-semibold text-accent hover:text-accent-dark transition"
                >
                  <UserPlus size={14} />
                  Adicionar candidato
                </button>
              )}
            </div>

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

                  <span
                    title="Percentual de adesão do currículo aos requisitos da vaga"
                    className={`ml-auto px-3 py-1 rounded-full text-white text-xs font-semibold shrink-0 ${matchScoreTone(entry.matchScore ?? 0)}`}
                  >
                    {entry.matchScore ?? 0}% de adesão
                  </span>
                </button>
              ))}
            </div>

            {isOpenStatus && (
              <div className="flex flex-col gap-2 mt-2">
                <button
                  onClick={() => setIsConcludeOpen(true)}
                  disabled={process.candidates.length === 0}
                  className="flex items-center justify-center gap-2 text-sm text-accent border border-accent/30 rounded-full py-2 hover:bg-accent/5 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Trophy size={16} />
                  Concluir processo
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => setIsCloseConfirmOpen(true)}
                    className="flex-1 flex items-center justify-center gap-2 text-sm text-muted border border-border rounded-full py-2 hover:bg-surface-soft transition"
                  >
                    Fechar processo
                  </button>

                  <button
                    onClick={() => setIsCancelConfirmOpen(true)}
                    className="flex-1 flex items-center justify-center gap-2 text-sm text-danger border border-danger/30 rounded-full py-2 hover:bg-danger-soft transition"
                  >
                    <XCircle size={16} />
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        isOpen={isCancelConfirmOpen}
        title="Cancelar processo seletivo"
        message="Isso encerra o processo seletivo como cancelado. Os candidatos continuam disponíveis em Analisar Candidatos. Confirma?"
        confirmLabel={cancelSelectionProcessMutation.isPending ? 'Cancelando...' : 'Cancelar processo'}
        cancelLabel="Voltar"
        onConfirm={handleConfirmCancel}
        onCancel={() => setIsCancelConfirmOpen(false)}
        tone="danger"
      />

      <ConfirmDialog
        isOpen={isCloseConfirmOpen}
        title="Fechar processo seletivo"
        message="Isso encerra o processo seletivo sem selecionar um candidato (por exemplo, quando a vaga deixou de ser necessária). Confirma?"
        confirmLabel={closeSelectionProcessMutation.isPending ? 'Fechando...' : 'Fechar processo'}
        cancelLabel="Voltar"
        onConfirm={handleConfirmClose}
        onCancel={() => setIsCloseConfirmOpen(false)}
      />

      <ConcludeSelectionProcessDialog
        isOpen={isConcludeOpen}
        candidates={process?.candidates ?? []}
        isSubmitting={concludeSelectionProcessMutation.isPending}
        onSubmit={handleConclude}
        onCancel={() => setIsConcludeOpen(false)}
      />

      <LinkJobOpeningDialog
        isOpen={isLinkJobOpen}
        currentJobOpeningId={process?.jobOpening?.id}
        isSubmitting={linkJobOpeningMutation.isPending}
        onSubmit={handleLinkJobOpening}
        onCancel={() => setIsLinkJobOpen(false)}
      />

      <AddCandidatesDialog
        isOpen={isAddCandidatesOpen}
        existingResumeIds={process?.candidates.map((entry) => entry.resumeId) ?? []}
        isSubmitting={addCandidatesMutation.isPending}
        onSubmit={handleAddCandidates}
        onCancel={() => setIsAddCandidatesOpen(false)}
      />

      <ResumeModal isOpen={Boolean(selectedResume)} onClose={() => setSelectedResume(null)} resume={selectedResume} />

      {actionErrorMessage && <Toast message={actionErrorMessage} onDismiss={() => setActionErrorMessage(null)} />}
    </>
  );
}
