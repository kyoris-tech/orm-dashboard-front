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
    const { data } = await backendClient.patch(`/admin/plans/${id}`, body, withBearerToken(token));
    return NextResponse.json(data);
  } catch (error) {
    return forwardAxiosError(error, 'Não foi possível atualizar o plano.');
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = await requireSessionToken();

  if (token instanceof NextResponse) {
    return token;
  }

  const { id } = await params;

  try {
    await backendClient.delete(`/admin/plans/${id}`, withBearerToken(token));
    return NextResponse.json({ id });
  } catch (error) {
    return forwardAxiosError(error, 'Não foi possível excluir o plano.');
  }
}
