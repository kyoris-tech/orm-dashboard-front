import { NextResponse } from 'next/server';
import { env } from '@/config/env';
import { requireSessionToken } from '@/lib/auth/require-session';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = await requireSessionToken();

  if (token instanceof NextResponse) {
    return token;
  }

  const { id } = await params;

  const response = await fetch(`${env.apiBaseUrl}/resumes/${id}/pdf`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'x-api-key': env.apiKey,
    },
  });

  if (!response.ok || !response.body) {
    return NextResponse.json({ message: 'Não foi possível gerar o PDF deste currículo.' }, { status: response.status || 502 });
  }

  return new NextResponse(response.body, {
    status: 200,
    headers: {
      'Content-Type': response.headers.get('content-type') ?? 'application/pdf',
      'Content-Disposition': response.headers.get('content-disposition') ?? 'attachment',
    },
  });
}
