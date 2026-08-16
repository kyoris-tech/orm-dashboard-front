import { NextResponse } from 'next/server';
import { clearSessionToken, clearSessionUser } from '@/lib/auth/session';

export async function POST() {
  await clearSessionToken();
  await clearSessionUser();

  return NextResponse.json({ ok: true });
}
