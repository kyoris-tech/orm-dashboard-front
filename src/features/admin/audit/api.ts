import { httpClient } from '@/lib/http/client';
import type { AuditLog } from '@/types/domain';

export interface AuditLogPage {
  items: AuditLog[];
  total: number;
  page: number;
  pageSize: number;
}

export interface GetAuditLogsParams {
  page: number;
  entityType?: string;
}

export async function getAuditLogs({ page, entityType }: GetAuditLogsParams): Promise<AuditLogPage> {
  const { data } = await httpClient.get<AuditLogPage>('/admin/audit-logs', {
    params: {
      page,
      ...(entityType ? { entityType } : {}),
    },
  });
  return data;
}
