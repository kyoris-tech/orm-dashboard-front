'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { getPublicJobOpenings } from '../api';

export function usePublicJobOpeningsQuery() {
  return useQuery({
    queryKey: queryKeys.publicJobOpening.list(),
    queryFn: getPublicJobOpenings,
    staleTime: 30_000,
  });
}
