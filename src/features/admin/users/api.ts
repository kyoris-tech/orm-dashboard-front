import { httpClient } from '@/lib/http/client';
import type { Status } from '@/types/domain';
import type { Paginated, PaginationParams } from '@/types/pagination';
import type { CreateUserInput, UserExportRecord, UserSummary } from '@/types/user';

export interface ListUsersParams extends PaginationParams {
  companyId?: string;
}

export async function getUsers(params: ListUsersParams = {}): Promise<Paginated<UserSummary>> {
  const { data } = await httpClient.get<Paginated<UserSummary>>('/admin/users', { params });
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

export async function updateUserPassword(id: string, password: string): Promise<void> {
  await httpClient.patch(`/admin/users/${id}/password`, { password });
}
