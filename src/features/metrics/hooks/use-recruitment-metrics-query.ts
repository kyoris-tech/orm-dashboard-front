'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { getSelectionProcesses } from '@/features/selection-processes/api';
import { computeRecruitmentMetrics } from '../compute-recruitment-metrics';

const METRICS_STALE_TIME_MS = 60_000;

export function useRecruitmentMetricsQuery() {
  return useQuery({
    queryKey: queryKeys.selectionProcesses.list(),
    queryFn: getSelectionProcesses,
    staleTime: METRICS_STALE_TIME_MS,
    select: computeRecruitmentMetrics,
  });
}
