'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { getUsers, type ListUsersParams } from '../api';

export function useUsersQuery(params: ListUsersParams = {}) {
  return useQuery({
    queryKey: queryKeys.users.list(params),
    queryFn: () => getUsers(params),
    staleTime: 30_000,
  });
}
