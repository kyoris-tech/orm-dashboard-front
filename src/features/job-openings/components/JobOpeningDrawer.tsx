'use client';

import { useState } from 'react';
import { Loader2, Users } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils/date';
import { CONTRACT_TYPE_LABELS, WORK_MODEL_LABELS } from '../labels';
import { useJobOpeningQuery } from '../hooks/use-job-opening-query';
import { SelectionProcessDrawer } from '@/features/selection-processes/components/SelectionProcessDrawer';

export interface JobOpeningDrawerProps {
  jobOpeningId: string | null;
  onClose: () => void;
}

export function JobOpeningDrawer({ jobOpeningId, onClose }: JobOpeningDrawerProps) {
  const jobOpeningQuery = useJobOpeningQuery(jobOpeningId);
  const [selectedProcessId, setSelectedProcessId] = useState<string | null>(null);

  const jobOpening = jobOpeningQuery.data;

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
              <Badge tone={jobOpening.status === 'OPEN' ? 'success' : 'neutral'}>{jobOpening.status === 'OPEN' ? 'Aberta' : 'Fechada'}</Badge>
              <span className="text-xs text-muted">Criada em {formatDate(jobOpening.createdAt)}</span>
            </div>

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

                      <Badge tone={process.status === 'OPEN' ? 'success' : 'neutral'}>{process.status === 'OPEN' ? 'Aberto' : 'Cancelado'}</Badge>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Drawer>

      <SelectionProcessDrawer processId={selectedProcessId} onClose={() => setSelectedProcessId(null)} />
    </>
  );
}
