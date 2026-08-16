'use client';

import { flexRender, type Table as ReactTable } from '@tanstack/react-table';
import { ArrowDownWideNarrow, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface DataTableProps<TData> {
  table: ReactTable<TData>;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  emptyMessage?: string;
  onRowClick?: (row: TData) => void;
  className?: string;
}

export function DataTable<TData>({
  table,
  isLoading,
  isError,
  errorMessage = 'Erro ao carregar dados.',
  emptyMessage = 'Nenhum resultado encontrado.',
  onRowClick,
  className,
}: DataTableProps<TData>) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 size={32} className="animate-spin text-accent" />
      </div>
    );
  }

  if (isError) {
    return <div className="text-center text-danger font-medium mt-10">{errorMessage}</div>;
  }

  const rows = table.getRowModel().rows;

  if (rows.length === 0) {
    return <div className="text-center h-[200px] text-muted mt-10 flex items-center justify-center">{emptyMessage}</div>;
  }

  return (
    <table className={cn('w-full min-w-[900px] text-left border-separate border-spacing-y-2 mt-4 text-sm md:text-base', className)}>
      <thead className="md:text-base text-sm text-muted">
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              const isSortable = header.column.getCanSort();
              const sorted = header.column.getIsSorted();

              return (
                <th
                  key={header.id}
                  onClick={isSortable ? header.column.getToggleSortingHandler() : undefined}
                  className={cn('px-4 py-2 font-medium select-none border-b border-border', isSortable ? 'cursor-pointer' : 'cursor-default')}
                >
                  <div className="flex items-center gap-2">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    {isSortable && (
                      <ArrowDownWideNarrow
                        size={20}
                        className={cn('text-accent transition-transform duration-200', sorted === 'asc' ? 'rotate-180' : 'rotate-0')}
                      />
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        ))}
      </thead>

      <tbody>
        {rows.map((row) => (
          <tr key={row.id} onClick={() => onRowClick?.(row.original)} className={cn('border border-transparent', onRowClick && 'cursor-pointer')}>
            {row.getVisibleCells().map((cell, index) => (
              <td
                key={cell.id}
                className={cn(
                  'pl-4 pr-7 py-6 md:text-base text-sm text-foreground font-medium border-b border-border text-left',
                  index === 0 && 'rounded-l-xl',
                  index === row.getVisibleCells().length - 1 && 'rounded-r-xl',
                )}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
