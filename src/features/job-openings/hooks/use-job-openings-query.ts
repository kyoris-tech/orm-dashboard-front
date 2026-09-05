'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import type { PaginationParams } from '@/types/pagination';
import { getJobOpenings } from '../api';

export function useJobOpeningsQuery(params: PaginationParams = {}) {
  return useQuery({
    queryKey: queryKeys.jobOpenings.list(params),
    queryFn: () => getJobOpenings(params),
  });
}
