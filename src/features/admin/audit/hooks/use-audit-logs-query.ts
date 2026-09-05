'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { getAuditLogs, type GetAuditLogsParams } from '../api';

const ALL_ENTITY_TYPES_VALUE = 'all';

export { ALL_ENTITY_TYPES_VALUE };

export function useAuditLogsQuery(params: GetAuditLogsParams) {
  const normalizedParams: GetAuditLogsParams = {
    ...params,
    entityType: params.entityType === ALL_ENTITY_TYPES_VALUE ? undefined : params.entityType,
  };

  return useQuery({
    queryKey: queryKeys.auditLogs.list(normalizedParams),
    queryFn: () => getAuditLogs(normalizedParams),
    staleTime: 15_000,
  });
}
