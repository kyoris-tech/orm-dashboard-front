'use client';

import { useMemo, useState } from 'react';
import { isAxiosError } from 'axios';
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Ban, CircleCheck, KeyRound, Pencil, Trash2 } from 'lucide-react';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Toast } from '@/components/ui/Toast';
import { formatDate } from '@/lib/utils/date';
import { getBillingStatus } from '@/lib/utils/billing';
import { useCompaniesQuery } from '../hooks/use-companies-query';
import { useUpdateCompanyDetailsMutation } from '../hooks/use-update-company-details-mutation';
import { useUpdateCompanyStatusMutation } from '../hooks/use-update-company-status-mutation';
import { useRegenerateCompanyTokenMutation } from '../hooks/use-regenerate-company-token-mutation';
import { EditCompanyDialog } from './EditCompanyDialog';
import { NewTokenDialog } from './NewTokenDialog';
import type { CompanySummary, CompanyStatus, UpdateCompanyInput } from '@/types/company';

const STATUS_LABELS: Record<CompanyStatus, string> = {
  ACTIVE: 'Ativa',
  INACTIVE: 'Inativa',
  BLOCKED: 'Bloqueada',
  PENDING: 'Pendente',
  DELETED: 'Excluída',
};

const STATUS_TONES: Record<CompanyStatus, 'neutral' | 'success' | 'danger'> = {
  ACTIVE: 'success',
  INACTIVE: 'neutral',
  BLOCKED: 'danger',
  PENDING: 'neutral',
  DELETED: 'danger',
};

const DEFAULT_ERROR_MESSAGE = 'Não foi possível concluir a ação.';

function extractErrorMessage(error: unknown): string {
  if (isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? DEFAULT_ERROR_MESSAGE;
  }

  return DEFAULT_ERROR_MESSAGE;
}

const columnHelper = createColumnHelper<CompanySummary>();

export function CompaniesTable() {
  const companiesQuery = useCompaniesQuery();
  const updateDetailsMutation = useUpdateCompanyDetailsMutation();
  const updateStatusMutation = useUpdateCompanyStatusMutation();
  const regenerateTokenMutation = useRegenerateCompanyTokenMutation();

  const [editingCompany, setEditingCompany] = useState<CompanySummary | null>(null);
  const [blockingCompany, setBlockingCompany] = useState<CompanySummary | null>(null);
  const [deletingCompany, setDeletingCompany] = useState<CompanySummary | null>(null);
  const [regeneratingCompany, setRegeneratingCompany] = useState<CompanySummary | null>(null);
  const [newToken, setNewToken] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleUpdateDetails(input: UpdateCompanyInput) {
    if (!editingCompany) {
      return;
    }

    updateDetailsMutation.mutate(
      { id: editingCompany.id, input },
      {
        onSuccess: () => setEditingCompany(null),
        onError: (error) => setErrorMessage(extractErrorMessage(error)),
      },
    );
  }

  function handleConfirmBlockToggle() {
    if (!blockingCompany) {
      return;
    }

    const nextStatus = blockingCompany.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';

    updateStatusMutation.mutate(
      { id: blockingCompany.id, status: nextStatus },
      {
        onSuccess: () => setBlockingCompany(null),
        onError: (error) => setErrorMessage(extractErrorMessage(error)),
      },
    );
  }

  function handleConfirmDelete() {
    if (!deletingCompany) {
      return;
    }

    updateStatusMutation.mutate(
      { id: deletingCompany.id, status: 'DELETED' },
      {
        onSuccess: () => setDeletingCompany(null),
        onError: (error) => setErrorMessage(extractErrorMessage(error)),
      },
    );
  }

  function handleConfirmRegenerate() {
    if (!regeneratingCompany) {
      return;
    }

    regenerateTokenMutation.mutate(regeneratingCompany.id, {
      onSuccess: (company) => {
        setRegeneratingCompany(null);
        setNewToken(company.apiKey);
      },
      onError: (error) => setErrorMessage(extractErrorMessage(error)),
    });
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', { header: 'Nome' }),
      columnHelper.accessor('email', { header: 'E-mail' }),
      columnHelper.accessor('cnpj', {
        header: 'CNPJ',
        cell: (info) => info.getValue() || 'N/A',
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => <Badge tone={STATUS_TONES[info.getValue()]}>{STATUS_LABELS[info.getValue()]}</Badge>,
      }),
      columnHelper.accessor((row) => row.plan.name, {
        id: 'plan',
        header: 'Plano',
        cell: (info) => <Badge tone="accent">{info.getValue()}</Badge>,
      }),
      columnHelper.accessor('billingDay', {
        header: 'Assinatura',
        cell: (info) => {
          const billing = getBillingStatus(info.getValue());
          return <Badge tone={billing.tone}>{billing.label}</Badge>;
        },
      }),
      columnHelper.accessor('createdAt', {
        header: 'Criada em',
        cell: (info) => formatDate(info.getValue()),
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Ações',
        cell: (info) => {
          const company = info.row.original;
          const isDeleted = company.status === 'DELETED';
          const isBlocked = company.status !== 'ACTIVE';

          return (
            <div className="flex items-center gap-3">
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  setEditingCompany(company);
                }}
                disabled={isDeleted}
                title="Editar empresa"
                className="text-muted hover:text-accent transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                aria-label="Editar empresa"
              >
                <Pencil size={16} />
              </button>

              <button
                onClick={(event) => {
                  event.stopPropagation();
                  setRegeneratingCompany(company);
                }}
                disabled={isDeleted}
                title="Gerar novo token"
                className="text-muted hover:text-accent transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                aria-label="Gerar novo token"
              >
                <KeyRound size={16} />
              </button>

              <button
                onClick={(event) => {
                  event.stopPropagation();
                  setBlockingCompany(company);
                }}
                disabled={isDeleted}
                title={isBlocked ? 'Ativar empresa' : 'Bloquear empresa'}
                aria-label={isBlocked ? 'Ativar empresa' : 'Bloquear empresa'}
                className="text-muted hover:text-accent transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {isBlocked ? <CircleCheck size={16} /> : <Ban size={16} />}
              </button>

              <button
                onClick={(event) => {
                  event.stopPropagation();
                  setDeletingCompany(company);
                }}
                disabled={isDeleted}
                title="Excluir empresa"
                className="text-muted hover:text-danger transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                aria-label="Excluir empresa"
              >
                <Trash2 size={16} />
              </button>
            </div>
          );
        },
      }),
    ],
    [],
  );

  const data = useMemo(() => companiesQuery.data ?? [], [companiesQuery.data]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full min-h-[300px] relative overflow-x-auto">
      <DataTable
        table={table}
        isLoading={companiesQuery.isLoading}
        isError={companiesQuery.isError}
        errorMessage="Não foi possível carregar as empresas."
        emptyMessage="Nenhuma empresa cadastrada ainda."
      />

      <EditCompanyDialog
        isOpen={Boolean(editingCompany)}
        company={editingCompany}
        isSubmitting={updateDetailsMutation.isPending}
        onSubmit={handleUpdateDetails}
        onCancel={() => setEditingCompany(null)}
      />

      <ConfirmDialog
        isOpen={Boolean(blockingCompany)}
        title={blockingCompany?.status === 'ACTIVE' ? 'Bloquear empresa' : 'Ativar empresa'}
        message={
          blockingCompany?.status === 'ACTIVE'
            ? `Nenhum usuário de "${blockingCompany?.name}" conseguirá fazer login enquanto a empresa estiver bloqueada. Confirma?`
            : `"${blockingCompany?.name}" voltará a poder fazer login normalmente. Confirma?`
        }
        confirmLabel={updateStatusMutation.isPending ? 'Aplicando...' : 'Confirmar'}
        cancelLabel="Cancelar"
        onConfirm={handleConfirmBlockToggle}
        onCancel={() => setBlockingCompany(null)}
        tone={blockingCompany?.status === 'ACTIVE' ? 'danger' : 'default'}
      />

      <ConfirmDialog
        isOpen={Boolean(deletingCompany)}
        title="Excluir empresa"
        message={`Isso desativa "${deletingCompany?.name}" (soft delete). A operação falha se a empresa ainda tiver usuários ativos. Confirma?`}
        confirmLabel={updateStatusMutation.isPending ? 'Excluindo...' : 'Excluir empresa'}
        cancelLabel="Voltar"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingCompany(null)}
        tone="danger"
      />

      <ConfirmDialog
        isOpen={Boolean(regeneratingCompany)}
        title="Gerar novo token"
        message={`O token atual de "${regeneratingCompany?.name}" será invalidado e substituído por um novo. Confirma?`}
        confirmLabel={regenerateTokenMutation.isPending ? 'Gerando...' : 'Gerar novo token'}
        cancelLabel="Cancelar"
        onConfirm={handleConfirmRegenerate}
        onCancel={() => setRegeneratingCompany(null)}
      />

      <NewTokenDialog token={newToken} onClose={() => setNewToken(null)} />

      {errorMessage && <Toast message={errorMessage} onDismiss={() => setErrorMessage(null)} />}
    </div>
  );
}
