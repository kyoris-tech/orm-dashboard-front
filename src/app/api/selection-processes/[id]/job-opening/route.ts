import { NextResponse } from 'next/server';
import { backendClient, withBearerToken } from '@/lib/http/backend-client';
import { forwardAxiosError } from '@/lib/http/forward-error';
import { requireSessionToken } from '@/lib/auth/require-session';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = await requireSessionToken();

  if (token instanceof NextResponse) {
    return token;
  }

  const { id } = await params;
  const body = await request.json();

  try {
    const { data } = await backendClient.patch(`/selection-processes/${id}/job-opening`, body, withBearerToken(token));
    return NextResponse.json(data);
  } catch (error) {
    return forwardAxiosError(error, 'Não foi possível vincular a vaga ao processo.');
  }
}
