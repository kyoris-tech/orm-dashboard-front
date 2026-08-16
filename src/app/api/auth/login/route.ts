import { NextResponse } from 'next/server';
import { isAxiosError } from 'axios';
import { backendClient } from '@/lib/http/backend-client';
import { setSessionToken, setSessionUser } from '@/lib/auth/session';
import type { LoginCredentials, LoginResponse, SessionUser } from '@/types/auth';

export async function POST(request: Request) {
  const credentials = (await request.json()) as LoginCredentials;

  try {
    const { data } = await backendClient.post<LoginResponse>('/auth/login', credentials);

    const sessionUser: SessionUser = {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      companyId: data.user.company_id,
      companyName: data.user.company_name,
      role: data.user.role,
    };

    await setSessionToken(data.access_token, data.expires_in);
    await setSessionUser(sessionUser, data.expires_in);

    return NextResponse.json({ user: sessionUser });
  } catch (error) {
    if (isAxiosError<{ message?: string }>(error)) {
      console.error('[login] axios error', {
        code: error.code,
        status: error.response?.status,
        data: error.response?.data,
        baseURL: error.config?.baseURL,
        url: error.config?.url,
      });

      const status = error.response?.status ?? 502;
      const message = error.response?.data?.message ?? 'Falha no login. Verifique suas credenciais.';
      return NextResponse.json({ message }, { status });
    }

    console.error('[login] non-axios error', error);

    return NextResponse.json({ message: 'Falha no login. Verifique suas credenciais.' }, { status: 500 });
  }
}
