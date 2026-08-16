'use client';

import { useMutation } from '@tanstack/react-query';
import { exportUsers } from '../api';

export function useExportUsersMutation() {
  return useMutation({
    mutationFn: exportUsers,
  });
}
