'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { getCompanyResumes } from '../api';

export function useCompanyResumesQuery() {
  return useQuery({
    queryKey: queryKeys.resumes.company(),
    queryFn: getCompanyResumes,
    staleTime: 30_000,
  });
}
