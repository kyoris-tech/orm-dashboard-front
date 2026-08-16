'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { concludeSelectionProcess } from '../api';

export function useConcludeSelectionProcessMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, resumeId }: { id: string; resumeId: string }) => concludeSelectionProcess(id, resumeId),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.selectionProcesses.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.jobOpenings.all });
    },
  });
}
