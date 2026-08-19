import { NextResponse } from 'next/server';
import { backendClient, withBearerToken } from '@/lib/http/backend-client';
import { forwardAxiosError } from '@/lib/http/forward-error';
import { requireSessionToken } from '@/lib/auth/require-session';

export async function POST(request: Request) {
  const token = await requireSessionToken();

  if (token instanceof NextResponse) {
    return token;
  }

  const body = await request.json();

  try {
    const { data } = await backendClient.post('/selection-processes/link-candidate', body, withBearerToken(token));
    return NextResponse.json(data);
  } catch (error) {
    return forwardAxiosError(error, 'Não foi possível vincular o candidato à vaga.');
  }
}
