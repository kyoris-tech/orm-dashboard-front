'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { regenerateCompanyToken } from '../api';

export function useRegenerateCompanyTokenMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => regenerateCompanyToken(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.all });
    },
  });
}
