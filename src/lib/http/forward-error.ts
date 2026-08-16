import { NextResponse } from 'next/server';
import { isAxiosError } from 'axios';

export function forwardAxiosError(error: unknown, fallbackMessage: string): NextResponse {
  if (isAxiosError<{ message?: string }>(error)) {
    const status = error.response?.status ?? 502;
    const message = error.response?.data?.message ?? fallbackMessage;
    return NextResponse.json({ message }, { status });
  }

  return NextResponse.json({ message: fallbackMessage }, { status: 500 });
}
