import { httpClient } from '@/lib/http/client';
import type { AdminResumeRecord } from './types';

const EXPORT_PAGE_SIZE = 2000;

export async function getAllResumesForMetrics(): Promise<AdminResumeRecord[]> {
  const { data } = await httpClient.get<{ data: AdminResumeRecord[] }>('/resumes', {
    params: { page: 1, pageSize: EXPORT_PAGE_SIZE },
  });
  return data.data ?? [];
}
