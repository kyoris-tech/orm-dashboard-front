import { httpClient } from '@/lib/http/client';
import type { LoginCredentials, SessionUser } from '@/types/auth';

export async function loginRequest(credentials: LoginCredentials): Promise<SessionUser> {
  const { data } = await httpClient.post<{ user: SessionUser }>('/auth/login', credentials);
  return data.user;
}

export async function logoutRequest(): Promise<void> {
  await httpClient.post('/auth/logout');
}
