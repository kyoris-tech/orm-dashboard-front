'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { updateJobOpening } from '../api';
import type { UpdateJobOpeningInput } from '@/types/job-opening';

export function useUpdateJobOpeningMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateJobOpeningInput }) => updateJobOpening(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobOpenings.all });
    },
  });
}
