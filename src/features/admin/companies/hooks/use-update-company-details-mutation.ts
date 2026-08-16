'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { updateCompanyDetails } from '../api';
import type { UpdateCompanyInput } from '@/types/company';

export function useUpdateCompanyDetailsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCompanyInput }) => updateCompanyDetails(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.all });
    },
  });
}
