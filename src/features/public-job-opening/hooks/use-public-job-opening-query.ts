'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { getPublicJobOpening } from '../api';

export function usePublicJobOpeningQuery(code: string) {
  return useQuery({
    queryKey: queryKeys.publicJobOpening.detail(code),
    queryFn: () => getPublicJobOpening(code),
    retry: false,
  });
}
