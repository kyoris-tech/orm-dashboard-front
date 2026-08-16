import { NextResponse } from 'next/server';
import { backendClient, withBearerToken } from '@/lib/http/backend-client';
import { forwardAxiosError } from '@/lib/http/forward-error';
import { requireSessionToken } from '@/lib/auth/require-session';

export async function GET() {
  const token = await requireSessionToken();

  if (token instanceof NextResponse) {
    return token;
  }

  try {
    const { data } = await backendClient.get('/users/export', withBearerToken(token));
    return NextResponse.json(data);
  } catch (error) {
    return forwardAxiosError(error, 'Não foi possível exportar os usuários.');
  }
}
