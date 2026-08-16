'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { updatePlan } from '../api';
import type { UpdatePlanInput } from '@/types/company';

export function useUpdatePlanMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdatePlanInput }) => updatePlan(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.plans.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.plan.all });
    },
  });
}
