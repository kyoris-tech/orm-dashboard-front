'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { getSelectionProcess } from '../api';

export function useSelectionProcessQuery(id: string | null) {
  return useQuery({
    queryKey: queryKeys.selectionProcesses.detail(id ?? 'idle'),
    queryFn: () => getSelectionProcess(id as string),
    enabled: Boolean(id),
  });
}
