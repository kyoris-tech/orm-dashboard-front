'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { getCompanies } from '../api';

export function useCompaniesQuery() {
  return useQuery({
    queryKey: queryKeys.companies.list(),
    queryFn: getCompanies,
    staleTime: 30_000,
  });
}
