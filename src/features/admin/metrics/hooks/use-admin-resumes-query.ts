'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { getAllResumesForMetrics } from '../api';

export function useAdminResumesQuery() {
  return useQuery({
    queryKey: queryKeys.resumes.adminMetrics(),
    queryFn: getAllResumesForMetrics,
    staleTime: 30_000,
  });
}
