'use client';

import { useMemo, useState } from 'react';
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils/date';
import { CONTRACT_TYPE_LABELS, JOB_OPENING_STATUS_LABELS, JOB_OPENING_STATUS_TONES, WORK_MODEL_LABELS } from '../labels';
import { useJobOpeningsQuery } from '../hooks/use-job-openings-query';
import { JobOpeningDrawer } from './JobOpeningDrawer';
import type { JobOpeningSummary } from '@/types/job-opening';
import { usePagination } from '@/lib/hooks/use-pagination';

const columnHelper = createColumnHelper<JobOpeningSummary>();

const columns = [
  columnHelper.accessor('title', { header: 'Título' }),
  columnHelper.accessor('workModel', {
    header: 'Modelo',
    cell: (info) => WORK_MODEL_LABELS[info.getValue()],
  }),
  columnHelper.accessor('contractType', {
    header: 'Contrato',
    cell: (info) => CONTRACT_TYPE_LABELS[info.getValue()],
  }),
  columnHelper.accessor('salaryRange', {
    header: 'Faixa salarial',
    cell: (info) => info.getValue() || 'N/A',
  }),
  columnHelper.accessor((row) => row._count.selectionProcesses, {
    id: 'selectionProcessCount',
    header: 'Processos vinculados',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: (info) => <Badge tone={JOB_OPENING_STATUS_TONES[info.getValue()]}>{JOB_OPENING_STATUS_LABELS[info.getValue()]}</Badge>,
  }),
  columnHelper.accessor('createdAt', {
    header: 'Criada em',
    cell: (info) => formatDate(info.getValue()),
  }),
];

export function JobOpeningsTable() {
  const { page, pageSize, setPage, setPageSize } = usePagination();
  const jobOpeningsQuery = useJobOpeningsQuery({ page, pageSize });
  const [selectedJobOpeningId, setSelectedJobOpeningId] = useState<string | null>(null);

  const data = useMemo(() => jobOpeningsQuery.data?.data ?? [], [jobOpeningsQuery.data]);
  const pagination = jobOpeningsQuery.data?.pagination;

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full min-h-[300px] relative overflow-x-auto">
      <DataTable
        table={table}
        isLoading={jobOpeningsQuery.isLoading}
        isError={jobOpeningsQuery.isError}
        errorMessage="Não foi possível carregar as vagas."
        emptyMessage="Nenhuma vaga publicada ainda."
        onRowClick={(row) => setSelectedJobOpeningId(row.id)}
      />

      {pagination && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={setPage}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
          totalLabel={`${pagination.totalItems} vaga(s)`}
        />
      )}

      <JobOpeningDrawer jobOpeningId={selectedJobOpeningId} onClose={() => setSelectedJobOpeningId(null)} />
    </div>
  );
}
