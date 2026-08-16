import { NextResponse } from 'next/server';
import { backendClient } from '@/lib/http/backend-client';
import { forwardAxiosError } from '@/lib/http/forward-error';

export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  try {
    const { data } = await backendClient.get(`/public/job-openings/${code}`);
    return NextResponse.json(data);
  } catch (error) {
    return forwardAxiosError(error, 'Não foi possível carregar os detalhes da vaga.');
  }
}
