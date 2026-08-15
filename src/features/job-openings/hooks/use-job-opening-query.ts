'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { getJobOpening } from '../api';

export function useJobOpeningQuery(id: string | null) {
  return useQuery({
    queryKey: queryKeys.jobOpenings.detail(id ?? 'idle'),
    queryFn: () => getJobOpening(id as string),
    enabled: Boolean(id),
  });
}
