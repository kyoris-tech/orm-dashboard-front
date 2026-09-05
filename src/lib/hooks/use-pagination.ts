'use client';

import { useState } from 'react';
import { DEFAULT_PAGE_SIZE } from '@/types/pagination';

export function usePagination(initialPageSize: number = DEFAULT_PAGE_SIZE) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  function setPageSize(nextPageSize: number) {
    setPageSizeState(nextPageSize);
    setPage(1);
  }

  return { page, pageSize, setPage, setPageSize };
}
