'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { getCompanyResumesForMetrics } from '../api';
import { computeMetrics } from '../compute-metrics';

const METRICS_STALE_TIME_MS = 60_000;

export function useResumesMetricsQuery() {
  return useQuery({
    queryKey: queryKeys.resumes.metricsSummary(),
    queryFn: getCompanyResumesForMetrics,
    staleTime: METRICS_STALE_TIME_MS,
    select: computeMetrics,
  });
}
