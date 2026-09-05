'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import type { PaginationParams } from '@/types/pagination';
import { getCompanies } from '../api';

export function useCompaniesQuery(params: PaginationParams = {}) {
  return useQuery({
    queryKey: queryKeys.companies.list(params),
    queryFn: () => getCompanies(params),
    staleTime: 30_000,
  });
}
