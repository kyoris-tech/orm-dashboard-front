import { httpClient } from '@/lib/http/client';
import type { CreateSelectionProcessInput, SelectionProcessDetail, SelectionProcessSummary } from '@/types/selection-process';

export async function getSelectionProcesses(): Promise<SelectionProcessSummary[]> {
  const { data } = await httpClient.get<SelectionProcessSummary[]>('/selection-processes');
  return data;
}

export async function getSelectionProcess(id: string): Promise<SelectionProcessDetail> {
  const { data } = await httpClient.get<SelectionProcessDetail>(`/selection-processes/${id}`);
  return data;
}

export async function createSelectionProcess(input: CreateSelectionProcessInput): Promise<SelectionProcessSummary> {
  const { data } = await httpClient.post<SelectionProcessSummary>('/selection-processes', input);
  return data;
}

export async function cancelSelectionProcess(id: string): Promise<SelectionProcessSummary> {
  const { data } = await httpClient.patch<SelectionProcessSummary>(`/selection-processes/${id}/cancel`);
  return data;
}

export async function closeSelectionProcess(id: string): Promise<SelectionProcessSummary> {
  const { data } = await httpClient.patch<SelectionProcessSummary>(`/selection-processes/${id}/close`);
  return data;
}

export async function concludeSelectionProcess(id: string, resumeId: string): Promise<SelectionProcessSummary> {
  const { data } = await httpClient.patch<SelectionProcessSummary>(`/selection-processes/${id}/conclude`, { resumeId });
  return data;
}

export async function linkJobOpeningToSelectionProcess(id: string, jobOpeningId: string): Promise<SelectionProcessSummary> {
  const { data } = await httpClient.patch<SelectionProcessSummary>(`/selection-processes/${id}/job-opening`, { jobOpeningId });
  return data;
}

export async function addCandidatesToSelectionProcess(id: string, resumeIds: string[]): Promise<SelectionProcessDetail> {
  const { data } = await httpClient.post<SelectionProcessDetail>(`/selection-processes/${id}/candidates`, { resumeIds });
  return data;
}
