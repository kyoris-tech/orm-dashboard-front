import { httpClient } from '@/lib/http/client';
import type { PublicJobOpening, PublicJobOpeningSummary } from '@/types/public-job-opening';

export async function getPublicJobOpenings(): Promise<PublicJobOpeningSummary[]> {
  const { data } = await httpClient.get<PublicJobOpeningSummary[]>('/public/job-openings');
  return data;
}

export async function getPublicJobOpening(code: string): Promise<PublicJobOpening> {
  const { data } = await httpClient.get<PublicJobOpening>(`/public/job-openings/${code}`);
  return data;
}

export async function applyToPublicJobOpening(code: string, file: File): Promise<void> {
  const formData = new FormData();
  formData.append('file', file);

  await httpClient.post(`/public/job-openings/${code}/apply`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}
