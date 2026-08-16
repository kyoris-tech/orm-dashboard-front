import { NextResponse } from 'next/server';
import { backendClient } from '@/lib/http/backend-client';
import { forwardAxiosError } from '@/lib/http/forward-error';

export async function GET() {
  try {
    const { data } = await backendClient.get('/public/job-openings');
    return NextResponse.json(data);
  } catch (error) {
    return forwardAxiosError(error, 'Não foi possível carregar as vagas.');
  }
}
