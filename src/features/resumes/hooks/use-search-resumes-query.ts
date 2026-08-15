'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { searchResumes } from '../api';
import type { ResumeSearchFilters } from '@/types/resumes';

export function useSearchResumesQuery(filters: ResumeSearchFilters) {
  return useQuery({
    queryKey: queryKeys.resumes.list(filters),
    queryFn: () => searchResumes(filters),
    placeholderData: keepPreviousData,
  });
}
