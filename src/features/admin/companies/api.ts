import { httpClient } from '@/lib/http/client';
import type { Status } from '@/types/domain';
import type { CompanySummary } from '@/types/company';

export async function getCompanies(): Promise<CompanySummary[]> {
  const { data } = await httpClient.get<CompanySummary[]>('/admin/companies');
  return data;
}

export async function updateCompanyName(id: string, name: string): Promise<CompanySummary> {
  const { data } = await httpClient.patch<CompanySummary>(`/admin/companies/${id}`, { name });
  return data;
}

export async function updateCompanyStatus(id: string, status: Status): Promise<CompanySummary> {
  const { data } = await httpClient.patch<CompanySummary>(`/admin/companies/${id}/status`, { status });
  return data;
}

export async function deleteCompany(id: string): Promise<CompanySummary> {
  return updateCompanyStatus(id, 'DELETED');
}

export async function regenerateCompanyToken(id: string): Promise<CompanySummary> {
  const { data } = await httpClient.post<CompanySummary>(`/admin/companies/${id}/regenerate-token`);
  return data;
}
