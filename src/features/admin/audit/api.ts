import { httpClient } from '@/lib/http/client';
import type { AuditLog } from '@/types/domain';
import type { Paginated, PaginationParams } from '@/types/pagination';

export interface GetAuditLogsParams extends PaginationParams {
  entityType?: string;
}

export async function getAuditLogs({ entityType, ...pagination }: GetAuditLogsParams): Promise<Paginated<AuditLog>> {
  const { data } = await httpClient.get<Paginated<AuditLog>>('/admin/audit-logs', {
    params: {
      ...pagination,
      ...(entityType ? { entityType } : {}),
    },
  });
  return data;
}
