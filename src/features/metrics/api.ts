import { httpClient } from '@/lib/http/client';
import type { ResumeListItem } from '@/types/resumes';

export async function getCompanyResumesForMetrics(): Promise<ResumeListItem[]> {
  const { data } = await httpClient.get<{ data: ResumeListItem[] }>('/resumes/metrics');
  return data.data ?? [];
}
