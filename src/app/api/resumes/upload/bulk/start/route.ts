import { NextResponse } from 'next/server';
import { env } from '@/config/env';
import { requireSessionToken } from '@/lib/auth/require-session';

export async function POST(request: Request) {
  const token = await requireSessionToken();

  if (token instanceof NextResponse) {
    return token;
  }

  const formData = await request.formData();

  const response = await fetch(`${env.apiBaseUrl}/resumes/upload/bulk/start`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'x-api-key': env.apiKey,
    },
    body: formData,
  });

  const data = await response.json();

  return NextResponse.json(data, { status: response.status });
}
