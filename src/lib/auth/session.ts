import { cookies } from 'next/headers';
import { env } from '@/config/env';
import type { SessionUser } from '@/types/auth';

const USER_COOKIE_NAME = `${env.jwtCookieName}_user`;

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

export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const raw = store.get(USER_COOKIE_NAME)?.value;

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

export async function setSessionUser(user: SessionUser, maxAgeSeconds: number): Promise<void> {
  const store = await cookies();
  store.set(USER_COOKIE_NAME, JSON.stringify(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: maxAgeSeconds,
  });
}

export async function clearSessionUser(): Promise<void> {
  const store = await cookies();
  store.delete(USER_COOKIE_NAME);
}
