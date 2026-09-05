'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import type { PaginationParams } from '@/types/pagination';
import { getSelectionProcesses } from '../api';

export function useSelectionProcessesQuery(params: PaginationParams = {}) {
  return useQuery({
    queryKey: queryKeys.selectionProcesses.list(params),
    queryFn: () => getSelectionProcesses(params),
  });
}
