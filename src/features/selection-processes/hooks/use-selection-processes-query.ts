'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { getSelectionProcesses } from '../api';

export function useSelectionProcessesQuery() {
  return useQuery({
    queryKey: queryKeys.selectionProcesses.list(),
    queryFn: getSelectionProcesses,
  });
}
