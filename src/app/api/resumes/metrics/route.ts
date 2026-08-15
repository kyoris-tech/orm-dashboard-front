import { NextResponse } from 'next/server';
import { backendClient, withBearerToken } from '@/lib/http/backend-client';
import { forwardAxiosError } from '@/lib/http/forward-error';
import { requireSessionToken } from '@/lib/auth/require-session';
import { getSessionUser } from '@/lib/auth/session';
import type { ResumeListItem } from '@/types/resumes';

const METRICS_FETCH_PAGE_SIZE = 500;

interface BackendResumeItem extends ResumeListItem {
  company?: { id: string } | null;
}

export async function GET() {
  const token = await requireSessionToken();

  if (token instanceof NextResponse) {
    return token;
  }

  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    return NextResponse.json({ message: 'Sessão expirada' }, { status: 401 });
  }

  try {
    const { data } = await backendClient.get<{ data: BackendResumeItem[] }>('/resumes', {
      ...withBearerToken(token),
      params: { page: 1, pageSize: METRICS_FETCH_PAGE_SIZE },
    });

    const companyResumes = (data.data ?? []).filter((resume) => resume.company?.id === sessionUser.companyId);

    return NextResponse.json({ data: companyResumes });
  } catch (error) {
    return forwardAxiosError(error, 'Não foi possível carregar as métricas.');
  }
}
