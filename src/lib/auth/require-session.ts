import { NextResponse } from 'next/server';
import { getSessionToken } from './session';

export async function requireSessionToken(): Promise<string | NextResponse> {
  const token = await getSessionToken();

  if (!token) {
    return NextResponse.json({ message: 'Sessão expirada' }, { status: 401 });
  }

  return token;
}
