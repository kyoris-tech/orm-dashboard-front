'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/DataTable';
import { formatDate } from '@/lib/utils/date';
import { CONTRACT_TYPE_LABELS, WORK_MODEL_LABELS } from '@/features/job-openings/labels';
import { usePublicJobOpeningsQuery } from '../hooks/use-public-job-openings-query';
import type { PublicJobOpeningSummary } from '@/types/public-job-opening';

const columnHelper = createColumnHelper<PublicJobOpeningSummary>();

const columns = [
  columnHelper.accessor('title', { header: 'Título' }),
  columnHelper.accessor('companyName', { header: 'Empresa' }),
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
    cell: (info) => info.getValue() || 'A combinar',
  }),
  columnHelper.accessor('createdAt', {
    header: 'Publicada em',
    cell: (info) => formatDate(info.getValue()),
  }),
];

export function PublicJobOpeningsListView() {
  const router = useRouter();
  const jobOpeningsQuery = usePublicJobOpeningsQuery();

  const data = useMemo(() => jobOpeningsQuery.data ?? [], [jobOpeningsQuery.data]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full max-w-6xl mx-auto md:p-6 p-4 flex flex-col items-center self-start">
      <h1 className="text-2xl font-bold text-foreground text-center mb-2">Vagas abertas</h1>
      <p className="text-muted text-sm text-center mb-8">Selecione uma vaga para ver os detalhes e enviar seu currículo.</p>

      <div className="w-full overflow-x-auto">
        <DataTable
          table={table}
          isLoading={jobOpeningsQuery.isLoading}
          isError={jobOpeningsQuery.isError}
          errorMessage="Não foi possível carregar as vagas."
          emptyMessage="Nenhuma vaga aberta no momento."
          onRowClick={(row) => router.push(`/vagas/${row.publicCode}`)}
        />
      </div>
    </div>
  );
}
