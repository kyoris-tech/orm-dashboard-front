'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { createSelectionProcess } from '../api';
import type { CreateSelectionProcessInput } from '@/types/selection-process';

export function useCreateSelectionProcessMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateSelectionProcessInput) => createSelectionProcess(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.selectionProcesses.all });
    },
  });
}
