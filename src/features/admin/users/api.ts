import { httpClient } from '@/lib/http/client';
import type { Status } from '@/types/domain';
import type { CreateUserInput, UserExportRecord, UserSummary } from '@/types/user';

export async function getUsers(): Promise<UserSummary[]> {
  const { data } = await httpClient.get<UserSummary[]>('/admin/users');
  return data;
}

export async function exportUsers(): Promise<UserExportRecord[]> {
  const { data } = await httpClient.get<UserExportRecord[]>('/admin/users/export');
  return data;
}

export async function createUser(input: CreateUserInput): Promise<UserSummary> {
  const { data } = await httpClient.post<UserSummary>('/admin/users', input);
  return data;
}

export async function updateUserStatus(id: string, status: Status): Promise<UserSummary> {
  const { data } = await httpClient.patch<UserSummary>(`/admin/users/${id}/status`, { status });
  return data;
}
