'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { getPlans } from '../api';

export function usePlansQuery() {
  return useQuery({
    queryKey: queryKeys.plans.list(),
    queryFn: getPlans,
    staleTime: 30_000,
  });
}
