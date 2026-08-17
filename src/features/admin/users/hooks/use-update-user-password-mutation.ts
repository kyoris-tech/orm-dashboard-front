'use client';

import { useMutation } from '@tanstack/react-query';
import { updateUserPassword } from '../api';

export function useUpdateUserPasswordMutation() {
  return useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) => updateUserPassword(id, password),
  });
}
