'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { getMyPlanUsage } from '../api';

export function useMyPlanQuery() {
  return useQuery({
    queryKey: queryKeys.plan.mine(),
    queryFn: getMyPlanUsage,
    staleTime: 30_000,
  });
}
