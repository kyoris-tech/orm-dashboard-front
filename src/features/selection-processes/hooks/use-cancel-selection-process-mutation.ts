'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { cancelSelectionProcess } from '../api';

export function useCancelSelectionProcessMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cancelSelectionProcess(id),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.selectionProcesses.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.jobOpenings.all });
    },
  });
}
