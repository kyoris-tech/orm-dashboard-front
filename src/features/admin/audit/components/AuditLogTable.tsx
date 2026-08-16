'use client';

import { useMemo } from 'react';
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { formatDateTime } from '@/lib/utils/date';
import { useAuditLogsQuery } from '../hooks/use-audit-logs-query';
import { actionLabel, entityTypeLabel } from '../labels';
import type { AuditLog } from '@/types/domain';

const columnHelper = createColumnHelper<AuditLog>();

const MAX_VALUE_PREVIEW_LENGTH = 60;

function truncateValue(value: string | null): string {
  if (!value) {
    return '—';
  }

  return value.length > MAX_VALUE_PREVIEW_LENGTH ? `${value.slice(0, MAX_VALUE_PREVIEW_LENGTH)}…` : value;
}

const columns = [
  columnHelper.accessor('createdAt', {
    header: 'Data',
    cell: (info) => formatDateTime(info.getValue()),
  }),
  columnHelper.accessor('entityType', {
    header: 'Entidade',
    cell: (info) => <Badge tone="neutral">{entityTypeLabel(info.getValue())}</Badge>,
  }),
  columnHelper.accessor('action', {
    header: 'Ação',
    cell: (info) => actionLabel(info.getValue()),
  }),
  columnHelper.display({
    id: 'change',
    header: 'Alteração',
    cell: (info) => {
      const { oldValue, newValue } = info.row.original;
      return (
        <span title={`${oldValue ?? '—'} → ${newValue ?? '—'}`}>
          {truncateValue(oldValue)} → {truncateValue(newValue)}
        </span>
      );
    },
  }),
  columnHelper.accessor('performedByName', { header: 'Responsável' }),
];

export interface AuditLogTableProps {
  page: number;
  entityType: string;
  onPageChange: (page: number) => void;
}

export function AuditLogTable({ page, entityType, onPageChange }: AuditLogTableProps) {
  const auditLogsQuery = useAuditLogsQuery(page, entityType);

  const data = useMemo(() => auditLogsQuery.data?.items ?? [], [auditLogsQuery.data]);
  const total = auditLogsQuery.data?.total ?? 0;
  const pageSize = auditLogsQuery.data?.pageSize ?? 25;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full min-h-[300px] relative overflow-x-auto">
      <DataTable
        table={table}
        isLoading={auditLogsQuery.isLoading}
        isError={auditLogsQuery.isError}
        errorMessage="Não foi possível carregar o log de auditoria."
        emptyMessage="Nenhum registro de auditoria encontrado."
      />

      {total > 0 && (
        <div className="flex items-center justify-between mt-4 text-sm text-muted">
          <span>
            Página {page} de {totalPages} · {total} registro{total === 1 ? '' : 's'}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-border hover:bg-surface-soft transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={14} />
              Anterior
            </button>

            <button
              type="button"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-border hover:bg-surface-soft transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Próxima
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
