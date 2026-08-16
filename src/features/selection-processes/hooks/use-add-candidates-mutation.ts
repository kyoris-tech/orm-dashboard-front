'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { addCandidatesToSelectionProcess } from '../api';

export function useAddCandidatesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, resumeIds }: { id: string; resumeIds: string[] }) => addCandidatesToSelectionProcess(id, resumeIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.selectionProcesses.all });
    },
  });
}
