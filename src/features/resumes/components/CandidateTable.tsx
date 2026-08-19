'use client';

import { useMemo, useState } from 'react';
import { isAxiosError } from 'axios';
import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type RowSelectionState,
  type SortingState,
} from '@tanstack/react-table';
import { Briefcase, CloudDownload, Flame, Link2, Trash } from 'lucide-react';
import { DataTable } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Toast } from '@/components/ui/Toast';
import { Checkbox } from '@/components/ui/Checkbox';
import { Button } from '@/components/ui/Button';
import { useSessionUser } from '@/context/SessionProvider';
import { useSearchResumesQuery } from '../hooks/use-search-resumes-query';
import { useUndoableDelete } from '../hooks/use-undoable-delete';
import { useHardDeleteResumeMutation } from '../hooks/use-hard-delete-resume-mutation';
import { downloadResumePdf } from '../api';
import { ResumeModal } from './ResumeModal';
import { CreateSelectionProcessDialog } from '@/features/selection-processes/components/CreateSelectionProcessDialog';
import { LinkCandidateToJobOpeningDialog } from '@/features/selection-processes/components/LinkCandidateToJobOpeningDialog';
import { useCreateSelectionProcessMutation } from '@/features/selection-processes/hooks/use-create-selection-process-mutation';
import { useLinkCandidateMutation } from '@/features/selection-processes/hooks/use-link-candidate-mutation';
import type { ResumeListItem, ResumeSearchFilters } from '@/types/resumes';

export interface CandidateTableProps {
  filters: ResumeSearchFilters;
  onPageChange: (page: number) => void;
  onSelectionProcessCreated?: () => void;
}

interface CandidateRow {
  id: string;
  compatibility: number;
  name: string;
  education: string;
  role: string;
  city: string;
  state: string;
  resume: ResumeListItem;
}

function toSafeText(value: string | undefined | null): string {
  return value && value.trim() !== '' ? value : 'N/A';
}

function compatibilityTone(value: number): string {
  if (value > 80) return 'bg-success';
  if (value >= 60) return 'bg-accent';
  if (value >= 30) return 'bg-[#FFD600] !text-[#001B30]';
  return 'bg-border !text-muted';
}

const DEFAULT_ERROR_MESSAGE = 'Não foi possível concluir esta ação.';

function extractErrorMessage(error: unknown): string {
  if (isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? DEFAULT_ERROR_MESSAGE;
  }

  return DEFAULT_ERROR_MESSAGE;
}

const columnHelper = createColumnHelper<CandidateRow>();

export function CandidateTable({ filters, onPageChange, onSelectionProcessCreated }: CandidateTableProps) {
  const sessionUser = useSessionUser();
  const isAdmin = sessionUser?.role === 'admin';

  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [selectedResume, setSelectedResume] = useState<ResumeListItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [actionErrorMessage, setActionErrorMessage] = useState<string | null>(null);
  const [hardDeleteId, setHardDeleteId] = useState<string | null>(null);
  const [isCreateProcessOpen, setIsCreateProcessOpen] = useState(false);
  const [linkingResume, setLinkingResume] = useState<CandidateRow | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const searchResumesQuery = useSearchResumesQuery(filters);
  const { requestDelete, undoDelete, dismiss, pendingId, isDeleting } = useUndoableDelete();
  const hardDeleteResumeMutation = useHardDeleteResumeMutation();
  const createSelectionProcessMutation = useCreateSelectionProcessMutation();
  const linkCandidateMutation = useLinkCandidateMutation();

  const rows = useMemo<CandidateRow[]>(() => {
    const resumes = searchResumesQuery.data?.data ?? [];

    return resumes.map((resume) => ({
      id: resume.id,
      compatibility: resume.compatibility ?? 0,
      name: toSafeText(resume.dataJson?.fullName ?? resume.fullName),
      education: toSafeText(resume.dataJson?.education?.[0]?.course),
      role: toSafeText(resume.dataJson?.experience?.[0]?.role),
      city: resume.dataJson?.location?.city ?? '',
      state: resume.dataJson?.location?.state ?? '',
      resume,
    }));
  }, [searchResumesQuery.data]);

  const selectedResumeIds = useMemo(() => Object.keys(rowSelection).filter((id) => rowSelection[id]), [rowSelection]);

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
            aria-label="Selecionar todos os candidatos"
          />
        ),
        cell: ({ row }) => (
          <div onClick={(event) => event.stopPropagation()}>
            <Checkbox checked={row.getIsSelected()} onChange={row.getToggleSelectedHandler()} aria-label="Selecionar candidato" />
          </div>
        ),
        enableSorting: false,
      }),
      columnHelper.accessor('compatibility', {
        header: 'Compatível',
        enableSorting: false,
        cell: (info) => {
          const value = info.getValue();
          return <div className={`px-3 py-1 rounded-full text-white text-sm font-semibold w-fit ${compatibilityTone(value)}`}>{value}%</div>;
        },
      }),
      columnHelper.accessor('name', { header: 'Nome' }),
      columnHelper.accessor('education', { header: 'Escolaridade' }),
      columnHelper.accessor('role', { header: 'Cargo' }),
      columnHelper.display({
        id: 'location',
        header: 'Localidade',
        cell: (info) => {
          const { city, state } = info.row.original;
          return city && state ? `${city}/${state}` : 'N/A';
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Ações',
        enableSorting: false,
        cell: (info) => {
          const row = info.row.original;

          return (
            <div className="flex gap-2 items-center">
              <button
                className="p-2 text-accent"
                title="Vincular a uma vaga"
                aria-label="Vincular a uma vaga"
                onClick={(event) => {
                  event.stopPropagation();
                  setLinkingResume(row);
                }}
              >
                <Link2 size={20} />
              </button>

              <button
                className="p-2 text-accent"
                title="Baixar PDF"
                aria-label="Baixar PDF"
                onClick={async (event) => {
                  event.stopPropagation();
                  try {
                    setDownloadError(null);
                    await downloadResumePdf(row.id, row.name);
                  } catch {
                    setDownloadError('Não foi possível gerar o PDF deste currículo.');
                  }
                }}
              >
                <CloudDownload size={24} />
              </button>

              {isAdmin && (
                <button
                  className="p-2 text-danger/70 hover:text-danger transition"
                  title="Excluir permanentemente"
                  aria-label="Excluir permanentemente"
                  onClick={(event) => {
                    event.stopPropagation();
                    setHardDeleteId(row.id);
                  }}
                >
                  <Flame size={20} />
                </button>
              )}

              <button
                className="p-2 text-foreground hover:text-danger transition"
                title="Excluir"
                aria-label="Excluir"
                onClick={(event) => {
                  event.stopPropagation();
                  requestDelete(row.id);
                }}
              >
                <Trash size={22} />
              </button>
            </div>
          );
        },
      }),
    ],
    [isAdmin, requestDelete],
  );

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting, rowSelection },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  function handleConfirmHardDelete() {
    if (!hardDeleteId) {
      return;
    }

    hardDeleteResumeMutation.mutate(hardDeleteId, {
      onSuccess: () => setHardDeleteId(null),
    });
  }

  function handleCreateSelectionProcess(name: string, jobOpeningId: string) {
    createSelectionProcessMutation.mutate(
      { name, resumeIds: selectedResumeIds, jobOpeningId: jobOpeningId || undefined },
      {
        onSuccess: () => {
          setRowSelection({});
          setIsCreateProcessOpen(false);
          onSelectionProcessCreated?.();
        },
        onError: (error) => setActionErrorMessage(extractErrorMessage(error)),
      },
    );
  }

  function handleLinkCandidate(jobOpeningId: string) {
    if (!linkingResume) {
      return;
    }

    linkCandidateMutation.mutate(
      { resumeId: linkingResume.id, jobOpeningId },
      {
        onSuccess: () => {
          setSuccessMessage(`${linkingResume.name} foi vinculado à vaga com sucesso.`);
          setLinkingResume(null);
        },
        onError: (error) => setActionErrorMessage(extractErrorMessage(error)),
      },
    );
  }

  const pagination = searchResumesQuery.data?.pagination;

  return (
    <div className="w-full min-h-[400px] relative overflow-x-auto">
      {downloadError && <p className="text-center text-danger text-sm mb-4">{downloadError}</p>}

      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-muted">
          {selectedResumeIds.length > 0 ? `${selectedResumeIds.length} candidato(s) selecionado(s)` : 'Selecione candidatos na tabela'}
        </span>

        <Button
          type="button"
          variant="accent"
          disabled={selectedResumeIds.length === 0}
          onClick={() => setIsCreateProcessOpen(true)}
          className="!w-auto !py-2 !px-4 text-sm flex items-center gap-2"
        >
          <Briefcase size={16} />
          Abrir Processo Seletivo
        </Button>
      </div>

      <DataTable
        table={table}
        isLoading={searchResumesQuery.isLoading}
        isError={searchResumesQuery.isError}
        errorMessage="Erro ao carregar dados."
        emptyMessage="Nenhum currículo encontrado."
        onRowClick={(row) => {
          setSelectedResume(row.resume);
          setIsModalOpen(true);
        }}
      />

      {pagination && pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={onPageChange}
          totalLabel={`Total Resultados: ${pagination.totalItems}`}
        />
      )}

      {pendingId && (
        <Toast message={isDeleting ? 'Excluindo...' : 'Currículo excluído.'} actionLabel="Desfazer" onAction={undoDelete} onDismiss={dismiss} />
      )}

      <ConfirmDialog
        isOpen={Boolean(hardDeleteId)}
        title="Excluir permanentemente"
        message="Essa ação apaga o currículo definitivamente do banco de dados, sem possibilidade de desfazer. Confirma?"
        confirmLabel={hardDeleteResumeMutation.isPending ? 'Excluindo...' : 'Excluir permanentemente'}
        cancelLabel="Cancelar"
        onConfirm={handleConfirmHardDelete}
        onCancel={() => setHardDeleteId(null)}
        tone="danger"
      />

      <CreateSelectionProcessDialog
        isOpen={isCreateProcessOpen}
        candidateCount={selectedResumeIds.length}
        isSubmitting={createSelectionProcessMutation.isPending}
        onSubmit={handleCreateSelectionProcess}
        onCancel={() => setIsCreateProcessOpen(false)}
      />

      <LinkCandidateToJobOpeningDialog
        isOpen={Boolean(linkingResume)}
        candidateName={linkingResume?.name ?? null}
        isSubmitting={linkCandidateMutation.isPending}
        onSubmit={handleLinkCandidate}
        onCancel={() => setLinkingResume(null)}
      />

      <ResumeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} resume={selectedResume} />

      {actionErrorMessage && <Toast message={actionErrorMessage} onDismiss={() => setActionErrorMessage(null)} />}
      {successMessage && <Toast message={successMessage} onDismiss={() => setSuccessMessage(null)} />}
    </div>
  );
}
