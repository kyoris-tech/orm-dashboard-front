'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { getSelectionProcesses } from '@/features/selection-processes/api';
import { ALL_ITEMS_PAGE_SIZE } from '@/types/pagination';
import { computeRecruitmentMetrics } from '../compute-recruitment-metrics';

const METRICS_STALE_TIME_MS = 60_000;

const METRICS_PAGE_PARAMS = { pageSize: ALL_ITEMS_PAGE_SIZE };

export function useRecruitmentMetricsQuery() {
  return useQuery({
    queryKey: queryKeys.selectionProcesses.list(METRICS_PAGE_PARAMS),
    queryFn: () => getSelectionProcesses(METRICS_PAGE_PARAMS),
    staleTime: METRICS_STALE_TIME_MS,
    select: (result) => computeRecruitmentMetrics(result.data),
  });
}
