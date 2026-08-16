import { httpClient } from '@/lib/http/client';
import type { CreateJobOpeningInput, JobOpeningDetail, JobOpeningSummary } from '@/types/job-opening';

export async function getJobOpenings(): Promise<JobOpeningSummary[]> {
  const { data } = await httpClient.get<JobOpeningSummary[]>('/job-openings');
  return data;
}

export async function getJobOpening(id: string): Promise<JobOpeningDetail> {
  const { data } = await httpClient.get<JobOpeningDetail>(`/job-openings/${id}`);
  return data;
}

export async function createJobOpening(input: CreateJobOpeningInput): Promise<JobOpeningSummary> {
  const { data } = await httpClient.post<JobOpeningSummary>('/job-openings', input);
  return data;
}

export async function cancelJobOpening(id: string): Promise<JobOpeningDetail> {
  const { data } = await httpClient.patch<JobOpeningDetail>(`/job-openings/${id}/cancel`);
  return data;
}
