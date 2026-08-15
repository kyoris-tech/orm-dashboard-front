'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { getJobOpenings } from '../api';

export function useJobOpeningsQuery() {
  return useQuery({
    queryKey: queryKeys.jobOpenings.list(),
    queryFn: getJobOpenings,
  });
}
