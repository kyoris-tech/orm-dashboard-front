'use client';

import { useCallback, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { getBulkUploadStatus, startBulkUpload } from '../api';
import type { BulkUploadStatus } from '@/types/resumes';

const POLL_INTERVAL_MS = 1500;

const INITIAL_PROGRESS: BulkUploadStatus = { total: 0, processed: 0, processing: 0, errors: 0, done: false };

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function useBulkUploadMutation() {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState<BulkUploadStatus>(INITIAL_PROGRESS);
  const cancelledRef = useRef(false);

  const mutation = useMutation({
    mutationFn: async (files: File[]) => {
      cancelledRef.current = false;
      setProgress(INITIAL_PROGRESS);

      const { jobId, total } = await startBulkUpload(files);
      setProgress((current) => ({ ...current, total }));

      let status: BulkUploadStatus = { ...INITIAL_PROGRESS, total };

      while (!status.done && !cancelledRef.current) {
        await wait(POLL_INTERVAL_MS);
        status = await getBulkUploadStatus(jobId);
        setProgress(status);
      }

      return status;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.resumes.recent() });
    },
  });

  const cancel = useCallback(() => {
    cancelledRef.current = true;
  }, []);

  return { ...mutation, progress, cancel };
}
