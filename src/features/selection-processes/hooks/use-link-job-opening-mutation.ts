'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { linkJobOpeningToSelectionProcess } from '../api';

export function useLinkJobOpeningMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, jobOpeningId }: { id: string; jobOpeningId: string }) => linkJobOpeningToSelectionProcess(id, jobOpeningId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.selectionProcesses.all });
    },
  });
}
