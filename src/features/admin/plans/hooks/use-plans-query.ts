'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import type { PaginationParams } from '@/types/pagination';
import { getPlans } from '../api';

export function usePlansQuery(params: PaginationParams = {}) {
  return useQuery({
    queryKey: queryKeys.plans.list(params),
    queryFn: () => getPlans(params),
    staleTime: 30_000,
  });
}
