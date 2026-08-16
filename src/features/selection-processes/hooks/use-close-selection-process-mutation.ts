'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { closeSelectionProcess } from '../api';

export function useCloseSelectionProcessMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => closeSelectionProcess(id),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.selectionProcesses.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.jobOpenings.all });
    },
  });
}
