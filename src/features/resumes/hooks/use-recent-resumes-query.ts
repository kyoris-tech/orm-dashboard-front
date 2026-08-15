'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { getRecentResumes } from '../api';

export function useRecentResumesQuery() {
  return useQuery({
    queryKey: queryKeys.resumes.recent(),
    queryFn: getRecentResumes,
  });
}
