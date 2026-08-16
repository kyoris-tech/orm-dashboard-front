'use client';

import { useMemo, useState } from 'react';
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils/date';
import { CONTRACT_TYPE_LABELS, JOB_OPENING_STATUS_LABELS, JOB_OPENING_STATUS_TONES, WORK_MODEL_LABELS } from '../labels';
import { useJobOpeningsQuery } from '../hooks/use-job-openings-query';
import { JobOpeningDrawer } from './JobOpeningDrawer';
import type { JobOpeningSummary } from '@/types/job-opening';

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
  const jobOpeningsQuery = useJobOpeningsQuery();
  const [selectedJobOpeningId, setSelectedJobOpeningId] = useState<string | null>(null);

  const data = useMemo(() => jobOpeningsQuery.data ?? [], [jobOpeningsQuery.data]);

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

      <JobOpeningDrawer jobOpeningId={selectedJobOpeningId} onClose={() => setSelectedJobOpeningId(null)} />
    </div>
  );
}
