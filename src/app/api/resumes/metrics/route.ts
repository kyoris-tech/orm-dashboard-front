import { NextResponse } from 'next/server';
import { forwardAxiosError } from '@/lib/http/forward-error';
import { requireSessionToken } from '@/lib/auth/require-session';
import { getSessionUser } from '@/lib/auth/session';
import { getCompanyScopedResumes } from '@/lib/resumes/get-company-scoped-resumes';

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
    const companyResumes = await getCompanyScopedResumes(token, sessionUser.companyId);
    return NextResponse.json({ data: companyResumes });
  } catch (error) {
    return forwardAxiosError(error, 'Não foi possível carregar as métricas.');
  }
}
