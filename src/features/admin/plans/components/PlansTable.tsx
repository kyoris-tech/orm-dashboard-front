'use client';

import { useMemo, useState } from 'react';
import { isAxiosError } from 'axios';
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Pencil, Trash2 } from 'lucide-react';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Toast } from '@/components/ui/Toast';
import { formatDate } from '@/lib/utils/date';
import { usePlansQuery } from '../hooks/use-plans-query';
import { useUpdatePlanMutation } from '../hooks/use-update-plan-mutation';
import { useDeletePlanMutation } from '../hooks/use-delete-plan-mutation';
import { PlanFormDialog } from './PlanFormDialog';
import { FEATURE_LABELS } from '../../../plan/labels';
import type { CreatePlanInput, Plan } from '@/types/company';

const DEFAULT_ERROR_MESSAGE = 'Não foi possível concluir a ação.';

function extractErrorMessage(error: unknown): string {
  if (isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? DEFAULT_ERROR_MESSAGE;
  }

  return DEFAULT_ERROR_MESSAGE;
}

const columnHelper = createColumnHelper<Plan>();

export function PlansTable() {
  const plansQuery = usePlansQuery();
  const updatePlanMutation = useUpdatePlanMutation();
  const deletePlanMutation = useDeletePlanMutation();

  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [deletingPlan, setDeletingPlan] = useState<Plan | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleUpdatePlan(input: CreatePlanInput) {
    if (!editingPlan) {
      return;
    }

    updatePlanMutation.mutate(
      { id: editingPlan.id, input },
      {
        onSuccess: () => setEditingPlan(null),
        onError: (error) => setErrorMessage(extractErrorMessage(error)),
      },
    );
  }

  function handleConfirmDelete() {
    if (!deletingPlan) {
      return;
    }

    deletePlanMutation.mutate(deletingPlan.id, {
      onSuccess: () => setDeletingPlan(null),
      onError: (error) => setErrorMessage(extractErrorMessage(error)),
    });
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', { header: 'Nome' }),
      columnHelper.accessor('maxUsers', {
        header: 'Usuários',
        cell: (info) => (info.getValue() === null ? 'Ilimitado' : info.getValue()),
      }),
      columnHelper.accessor('maxResumesPerMonth', {
        header: 'Currículos/mês',
        cell: (info) => (info.getValue() === null ? 'Ilimitado' : info.getValue()),
      }),
      columnHelper.accessor('features', {
        header: 'Funcionalidades',
        cell: (info) =>
          info.getValue().length === 0 ? (
            <span className="text-muted text-sm">Nenhuma</span>
          ) : (
            <div className="flex flex-wrap gap-2">
              {info.getValue().map((feature) => (
                <Badge key={feature} tone="accent">
                  {FEATURE_LABELS[feature]}
                </Badge>
              ))}
            </div>
          ),
      }),
      columnHelper.accessor('companyCount', {
        header: 'Empresas',
        cell: (info) => info.getValue() ?? 0,
      }),
      columnHelper.accessor('createdAt', {
        header: 'Criado em',
        cell: (info) => formatDate(info.getValue()),
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Ações',
        cell: (info) => {
          const plan = info.row.original;
          const hasCompanies = (plan.companyCount ?? 0) > 0;

          return (
            <div className="flex items-center gap-3">
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  setEditingPlan(plan);
                }}
                title="Editar plano"
                className="text-muted hover:text-accent transition cursor-pointer"
                aria-label="Editar plano"
              >
                <Pencil size={16} />
              </button>

              <button
                onClick={(event) => {
                  event.stopPropagation();
                  setDeletingPlan(plan);
                }}
                disabled={hasCompanies}
                title={hasCompanies ? 'Só é possível excluir planos sem empresas vinculadas' : 'Excluir plano'}
                aria-label="Excluir plano"
                className="text-muted hover:text-danger transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
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

  const data = useMemo(() => plansQuery.data ?? [], [plansQuery.data]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full min-h-[300px] relative overflow-x-auto">
      <DataTable
        table={table}
        isLoading={plansQuery.isLoading}
        isError={plansQuery.isError}
        errorMessage="Não foi possível carregar os planos."
        emptyMessage="Nenhum plano cadastrado ainda."
      />

      <PlanFormDialog
        isOpen={Boolean(editingPlan)}
        plan={editingPlan}
        isSubmitting={updatePlanMutation.isPending}
        onSubmit={handleUpdatePlan}
        onCancel={() => setEditingPlan(null)}
      />

      <ConfirmDialog
        isOpen={Boolean(deletingPlan)}
        title="Excluir plano"
        message={`Isso exclui o plano "${deletingPlan?.name}" definitivamente. Confirma?`}
        confirmLabel={deletePlanMutation.isPending ? 'Excluindo...' : 'Excluir plano'}
        cancelLabel="Cancelar"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingPlan(null)}
        tone="danger"
      />

      {errorMessage && <Toast message={errorMessage} onDismiss={() => setErrorMessage(null)} />}
    </div>
  );
}
