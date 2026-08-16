import { backendClient, withBearerToken } from '@/lib/http/backend-client';
import type { ResumeListItem } from '@/types/resumes';

const FETCH_PAGE_SIZE = 500;

interface BackendResumeItem extends ResumeListItem {
  company?: { id: string } | null;
}

export async function getCompanyScopedResumes(token: string, companyId: string): Promise<ResumeListItem[]> {
  const { data } = await backendClient.get<{ data: BackendResumeItem[] }>('/resumes', {
    ...withBearerToken(token),
    params: { page: 1, pageSize: FETCH_PAGE_SIZE },
  });

  return (data.data ?? []).filter((resume) => resume.company?.id === companyId);
}
