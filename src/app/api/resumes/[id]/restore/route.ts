import { NextResponse } from 'next/server';
import { backendClient, withBearerToken } from '@/lib/http/backend-client';
import { forwardAxiosError } from '@/lib/http/forward-error';
import { requireSessionToken } from '@/lib/auth/require-session';

export async function PATCH(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = await requireSessionToken();

  if (token instanceof NextResponse) {
    return token;
  }

  const { id } = await params;

  try {
    const { data } = await backendClient.patch(`/resumes/${id}/restore`, undefined, withBearerToken(token));
    return NextResponse.json(data);
  } catch (error) {
    return forwardAxiosError(error, 'Não foi possível restaurar o currículo.');
  }
}
