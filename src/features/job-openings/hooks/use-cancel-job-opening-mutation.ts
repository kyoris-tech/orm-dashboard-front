'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { cancelJobOpening } from '../api';

export function useCancelJobOpeningMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cancelJobOpening(id),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobOpenings.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.selectionProcesses.all });
    },
  });
}
