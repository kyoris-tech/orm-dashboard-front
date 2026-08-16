'use client';

import { useMemo, useState } from 'react';
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Loader2 } from 'lucide-react';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils/date';
import { useSelectionProcessesQuery } from '../hooks/use-selection-processes-query';
import { SelectionProcessDrawer } from './SelectionProcessDrawer';
import { SELECTION_PROCESS_STATUS_LABELS, SELECTION_PROCESS_STATUS_TONES } from '../labels';
import type { SelectionProcessSummary } from '@/types/selection-process';

const columnHelper = createColumnHelper<SelectionProcessSummary>();

const columns = [
  columnHelper.accessor('name', { header: 'Nome' }),
  columnHelper.accessor((row) => row._count.candidates, {
    id: 'candidateCount',
    header: 'Candidatos',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor((row) => row.jobOpening?.title, {
    id: 'jobOpening',
    header: 'Vaga',
    cell: (info) => info.getValue() ?? 'N/A',
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: (info) => <Badge tone={SELECTION_PROCESS_STATUS_TONES[info.getValue()]}>{SELECTION_PROCESS_STATUS_LABELS[info.getValue()]}</Badge>,
  }),
  columnHelper.accessor('createdAt', {
    header: 'Criado em',
    cell: (info) => formatDate(info.getValue()),
  }),
];

export function SelectionProcessesTable() {
  const selectionProcessesQuery = useSelectionProcessesQuery();
  const [selectedProcessId, setSelectedProcessId] = useState<string | null>(null);

  const data = useMemo(() => selectionProcessesQuery.data ?? [], [selectionProcessesQuery.data]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (selectionProcessesQuery.isLoading) {
    return (
      <div className="flex justify-center items-center h-[20rem]">
        <Loader2 className="animate-spin text-accent" size={28} />
      </div>
    );
  }

  return (
    <div className="w-full min-h-[300px] relative overflow-x-auto">
      <DataTable
        table={table}
        isError={selectionProcessesQuery.isError}
        errorMessage="Não foi possível carregar os processos seletivos."
        emptyMessage="Nenhum processo seletivo aberto ainda. Selecione candidatos em Analisar Candidatos para abrir o primeiro."
        onRowClick={(row) => setSelectedProcessId(row.id)}
      />

      <SelectionProcessDrawer processId={selectedProcessId} onClose={() => setSelectedProcessId(null)} />
    </div>
  );
}
