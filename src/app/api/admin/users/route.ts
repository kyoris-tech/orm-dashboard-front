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
    const { data } = await backendClient.get('/users', withBearerToken(token));
    return NextResponse.json(data);
  } catch (error) {
    return forwardAxiosError(error, 'Não foi possível carregar os usuários.');
  }
}

export async function POST(request: Request) {
  const token = await requireSessionToken();

  if (token instanceof NextResponse) {
    return token;
  }

  const body = await request.json();

  try {
    const { data } = await backendClient.post('/users', body, withBearerToken(token));
    return NextResponse.json(data);
  } catch (error) {
    return forwardAxiosError(error, 'Não foi possível cadastrar o usuário.');
  }
}
