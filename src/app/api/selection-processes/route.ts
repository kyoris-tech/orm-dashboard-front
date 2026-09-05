import { NextResponse } from 'next/server';
import { backendClient, withBearerToken } from '@/lib/http/backend-client';
import { forwardAxiosError } from '@/lib/http/forward-error';
import { requireSessionToken } from '@/lib/auth/require-session';

export async function GET(request: Request) {
  const token = await requireSessionToken();

  if (token instanceof NextResponse) {
    return token;
  }

  const { searchParams } = new URL(request.url);

  try {
    const { data } = await backendClient.get('/selection-processes', {
      ...withBearerToken(token),
      params: Object.fromEntries(searchParams),
    });
    return NextResponse.json(data);
  } catch (error) {
    return forwardAxiosError(error, 'Não foi possível carregar os processos seletivos.');
  }
}

export async function POST(request: Request) {
  const token = await requireSessionToken();

  if (token instanceof NextResponse) {
    return token;
  }

  const body = await request.json();

  try {
    const { data } = await backendClient.post('/selection-processes', body, withBearerToken(token));
    return NextResponse.json(data);
  } catch (error) {
    return forwardAxiosError(error, 'Não foi possível abrir o processo seletivo.');
  }
}
