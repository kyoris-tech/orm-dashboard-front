'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { linkCandidateToJobOpening } from '../api';

export function useLinkCandidateMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ resumeId, jobOpeningId }: { resumeId: string; jobOpeningId: string }) =>
      linkCandidateToJobOpening(resumeId, jobOpeningId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.selectionProcesses.all });
    },
  });
}
