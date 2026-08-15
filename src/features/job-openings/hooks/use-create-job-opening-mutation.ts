'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { createJobOpening } from '../api';

export function useCreateJobOpeningMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createJobOpening,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobOpenings.all });
    },
  });
}
