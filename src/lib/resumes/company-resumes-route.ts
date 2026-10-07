import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { authenticatedRoute } from '@/lib/http/proxy-handler';
import { getCompanyScopedResumes } from '@/lib/resumes/get-company-scoped-resumes';

export function companyResumesRoute(errorMessage: string) {
  return authenticatedRoute(errorMessage, async ({ token }) => {
    const sessionUser = await getSessionUser();

    if (!sessionUser) {
      return NextResponse.json({ message: 'Sessão expirada' }, { status: 401 });
    }

    const companyResumes = await getCompanyScopedResumes(token, sessionUser.companyId);
    return NextResponse.json({ data: companyResumes });
  });
}
