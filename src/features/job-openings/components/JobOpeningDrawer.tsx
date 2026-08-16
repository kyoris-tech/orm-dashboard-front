'use client';

import { useState } from 'react';
import { isAxiosError } from 'axios';
import { Check, Copy, Loader2, Users, XCircle } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Toast } from '@/components/ui/Toast';
import { formatDate } from '@/lib/utils/date';
import { buildJobOpeningPublicUrl } from '@/lib/utils/job-opening-link';
import { CONTRACT_TYPE_LABELS, JOB_OPENING_STATUS_LABELS, JOB_OPENING_STATUS_TONES, WORK_MODEL_LABELS } from '../labels';
import { useJobOpeningQuery } from '../hooks/use-job-opening-query';
import { useCancelJobOpeningMutation } from '../hooks/use-cancel-job-opening-mutation';
import { SelectionProcessDrawer } from '@/features/selection-processes/components/SelectionProcessDrawer';
import { SELECTION_PROCESS_STATUS_LABELS, SELECTION_PROCESS_STATUS_TONES } from '@/features/selection-processes/labels';

function JobOpeningShareLink({ publicCode }: { publicCode: string }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = buildJobOpeningPublicUrl(publicCode);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div>
      <p className="text-sm text-muted mb-2">Link para candidatos</p>
      <div className="flex items-center gap-2 bg-surface-soft border border-border rounded-xl px-4 py-3">
        <span className="text-xs text-foreground break-all flex-1 text-left">{shareUrl}</span>
        <button
          onClick={handleCopy}
          title="Copiar link"
          className="shrink-0 text-accent hover:text-accent-dark transition p-1"
          aria-label="Copiar link"
        >
          {copied ? <Check size={18} /> : <Copy size={18} />}
        </button>
      </div>
    </div>
  );
}

const DEFAULT_ERROR_MESSAGE = 'Não foi possível concluir esta ação.';

function extractErrorMessage(error: unknown): string {
  if (isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? DEFAULT_ERROR_MESSAGE;
  }

  return DEFAULT_ERROR_MESSAGE;
}

export interface JobOpeningDrawerProps {
  jobOpeningId: string | null;
  onClose: () => void;
}

export function JobOpeningDrawer({ jobOpeningId, onClose }: JobOpeningDrawerProps) {
  const jobOpeningQuery = useJobOpeningQuery(jobOpeningId);
  const cancelJobOpeningMutation = useCancelJobOpeningMutation();
  const [selectedProcessId, setSelectedProcessId] = useState<string | null>(null);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [actionErrorMessage, setActionErrorMessage] = useState<string | null>(null);

  const jobOpening = jobOpeningQuery.data;
  const isOpenStatus = jobOpening?.status === 'OPEN';

  function handleConfirmCancel() {
    if (!jobOpeningId) {
      return;
    }

    cancelJobOpeningMutation.mutate(jobOpeningId, {
      onSuccess: () => setIsCancelConfirmOpen(false),
      onError: (error) => setActionErrorMessage(extractErrorMessage(error)),
    });
  }

  return (
    <>
      <Drawer isOpen={Boolean(jobOpeningId)} onClose={onClose} title={jobOpening?.title ?? 'Vaga'}>
        {jobOpeningQuery.isLoading && (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="animate-spin text-accent" size={24} />
          </div>
        )}

        {jobOpeningQuery.isError && <p className="text-danger text-sm">Não foi possível carregar os detalhes da vaga.</p>}

        {jobOpening && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <Badge tone={JOB_OPENING_STATUS_TONES[jobOpening.status]}>{JOB_OPENING_STATUS_LABELS[jobOpening.status]}</Badge>
              <span className="text-xs text-muted">Criada em {formatDate(jobOpening.createdAt)}</span>
            </div>

            <JobOpeningShareLink publicCode={jobOpening.publicCode} />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted">Modelo</p>
                <p className="text-foreground font-medium">{WORK_MODEL_LABELS[jobOpening.workModel]}</p>
              </div>

              <div>
                <p className="text-muted">Contrato</p>
                <p className="text-foreground font-medium">{CONTRACT_TYPE_LABELS[jobOpening.contractType]}</p>
              </div>

              {jobOpening.salaryRange && (
                <div className="col-span-2">
                  <p className="text-muted">Faixa salarial</p>
                  <p className="text-foreground font-medium">{jobOpening.salaryRange}</p>
                </div>
              )}
            </div>

            {jobOpening.requirements.length > 0 && (
              <div>
                <p className="text-sm text-muted mb-2">Requisitos principais</p>
                <div className="flex flex-wrap gap-2">
                  {jobOpening.requirements.map((requirement) => (
                    <Badge key={requirement} tone="accent">
                      {requirement}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {jobOpening.differentials.length > 0 && (
              <div>
                <p className="text-sm text-muted mb-2">Diferenciais</p>
                <div className="flex flex-wrap gap-2">
                  {jobOpening.differentials.map((differential) => (
                    <Badge key={differential} tone="neutral">
                      {differential}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="text-sm text-muted mb-2">
                {jobOpening.selectionProcesses.length} processo{jobOpening.selectionProcesses.length === 1 ? '' : 's'} seletivo
                {jobOpening.selectionProcesses.length === 1 ? '' : 's'} vinculado{jobOpening.selectionProcesses.length === 1 ? '' : 's'}
              </p>

              {jobOpening.selectionProcesses.length === 0 ? (
                <p className="text-sm text-muted">Nenhum processo seletivo vinculado a esta vaga ainda.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {jobOpening.selectionProcesses.map((process) => (
                    <button
                      key={process.id}
                      onClick={() => setSelectedProcessId(process.id)}
                      className="flex items-center justify-between gap-3 text-left border border-border rounded-xl px-4 py-3 hover:bg-surface-soft transition"
                    >
                      <span className="flex items-center gap-3">
                        <span className="bg-surface-soft text-accent rounded-full p-2 shrink-0">
                          <Users size={16} />
                        </span>
                        <span className="flex flex-col">
                          <span className="text-sm font-medium text-foreground">{process.name}</span>
                          <span className="text-xs text-muted">
                            {process._count.candidates} candidato{process._count.candidates === 1 ? '' : 's'} · {formatDate(process.createdAt)}
                          </span>
                        </span>
                      </span>

                      <Badge tone={SELECTION_PROCESS_STATUS_TONES[process.status]}>{SELECTION_PROCESS_STATUS_LABELS[process.status]}</Badge>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {isOpenStatus && (
              <button
                onClick={() => setIsCancelConfirmOpen(true)}
                className="flex items-center justify-center gap-2 text-sm text-danger border border-danger/30 rounded-full py-2 hover:bg-danger-soft transition mt-2"
              >
                <XCircle size={16} />
                Cancelar vaga
              </button>
            )}
          </div>
        )}
      </Drawer>

      <SelectionProcessDrawer processId={selectedProcessId} onClose={() => setSelectedProcessId(null)} />

      <ConfirmDialog
        isOpen={isCancelConfirmOpen}
        title="Cancelar vaga"
        message="Isso encerra a vaga publicada como cancelada e cancela também os processos seletivos em andamento vinculados a ela. Confirma?"
        confirmLabel={cancelJobOpeningMutation.isPending ? 'Cancelando...' : 'Cancelar vaga'}
        cancelLabel="Voltar"
        onConfirm={handleConfirmCancel}
        onCancel={() => setIsCancelConfirmOpen(false)}
        tone="danger"
      />

      {actionErrorMessage && <Toast message={actionErrorMessage} onDismiss={() => setActionErrorMessage(null)} />}
    </>
  );
}
