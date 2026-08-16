import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { env } from '@/config/env';

const AUTH_ONLY_PUBLIC_PATHS = ['/login'];
const ALWAYS_PUBLIC_PATHS = ['/vagas'];
const ALWAYS_PUBLIC_PATH_PREFIXES = ['/vagas/'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(env.jwtCookieName);
  const isLoginPath = AUTH_ONLY_PUBLIC_PATHS.includes(pathname);
  const isAlwaysPublicPath =
    ALWAYS_PUBLIC_PATHS.includes(pathname) || ALWAYS_PUBLIC_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (!hasSession && !isLoginPath && !isAlwaysPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (hasSession && isLoginPath) {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|icon|apple-icon).*)'],
};
