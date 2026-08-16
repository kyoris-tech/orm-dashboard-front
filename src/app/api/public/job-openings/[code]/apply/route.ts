import { NextResponse } from 'next/server';
import { env } from '@/config/env';

export async function POST(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const formData = await request.formData();

  const response = await fetch(`${env.apiBaseUrl}/public/job-openings/${code}/apply`, {
    method: 'POST',
    headers: {
      'x-api-key': env.apiKey,
    },
    body: formData,
  });

  const data = await response.json();

  return NextResponse.json(data, { status: response.status });
}
