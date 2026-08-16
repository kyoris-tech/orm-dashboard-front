'use client';

import { useMutation } from '@tanstack/react-query';
import { applyToPublicJobOpening } from '../api';

export function useApplyMutation(code: string) {
  return useMutation({
    mutationFn: (file: File) => applyToPublicJobOpening(code, file),
  });
}
