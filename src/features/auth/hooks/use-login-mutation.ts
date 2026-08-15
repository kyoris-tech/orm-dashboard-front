'use client';

import { useMutation } from '@tanstack/react-query';
import { loginRequest } from '../api';
import type { LoginCredentials } from '@/types/auth';

export function useLoginMutation() {
  return useMutation({
    mutationFn: (credentials: LoginCredentials) => loginRequest(credentials),
  });
}
