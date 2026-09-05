'use client';

import { useMemo, useState } from 'react';
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import { DEFAULT_PAGE_SIZE } from '@/types/pagination';
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
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const auditLogsQuery = useAuditLogsQuery({ page, pageSize, entityType });

  const data = useMemo(() => auditLogsQuery.data?.data ?? [], [auditLogsQuery.data]);
  const pagination = auditLogsQuery.data?.pagination;

  function handlePageSizeChange(nextPageSize: number) {
    setPageSize(nextPageSize);
    onPageChange(1);
  }

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

      {pagination && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={onPageChange}
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
          totalLabel={`${pagination.totalItems} registro(s)`}
        />
      )}
    </div>
  );
}
