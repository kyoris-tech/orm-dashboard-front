import { cookies } from 'next/headers';
import { env } from '@/config/env';

export async function getSessionToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(env.jwtCookieName)?.value;
}

export async function setSessionToken(token: string, maxAgeSeconds: number): Promise<void> {
  const store = await cookies();
  store.set(env.jwtCookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: maxAgeSeconds,
  });
}

export async function clearSessionToken(): Promise<void> {
  const store = await cookies();
  store.delete(env.jwtCookieName);
}
