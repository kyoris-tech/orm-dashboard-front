'use client';

import { PAGE_SIZE_OPTIONS } from '@/types/pagination';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  onPageSizeChange?: (pageSize: number) => void;
  totalLabel?: string;
  rightSlot?: React.ReactNode;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  onPageSizeChange,
  totalLabel,
  rightSlot,
}: PaginationProps) {
  const visiblePages = Array.from({ length: totalPages }, (_, index) => index + 1).slice(
    Math.max(0, currentPage - 3),
    Math.min(totalPages, currentPage + 2),
  );

  const pageSizeSelector =
    pageSize !== undefined && onPageSizeChange ? (
      <label className="flex items-center gap-2 whitespace-nowrap">
        <span>Itens por página</span>
        <select
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
          className="rounded-lg border border-border bg-surface px-2 py-1 text-foreground"
        >
          {PAGE_SIZE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
    ) : null;

  return (
    <div className="flex items-center justify-between gap-4 px-6 py-4 text-sm text-muted flex-wrap">
      {totalLabel ? <span>{totalLabel}</span> : <span />}

      <div className="flex items-center gap-3">
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="text-muted hover:text-foreground disabled:opacity-40"
        >
          &lt;
        </button>

        {visiblePages.map((page) => (
          <button key={page} onClick={() => onPageChange(page)} className={page === currentPage ? 'px-2 text-accent font-medium' : 'px-2'}>
            {page.toString().padStart(2, '0')}
          </button>
        ))}

        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="text-muted hover:text-foreground disabled:opacity-40"
        >
          &gt;
        </button>
      </div>

      {rightSlot ?? pageSizeSelector ?? <span />}
    </div>
  );
}
