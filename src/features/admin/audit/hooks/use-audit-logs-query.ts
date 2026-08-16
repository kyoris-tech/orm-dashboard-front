'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { getAuditLogs } from '../api';

const ALL_ENTITY_TYPES_VALUE = 'all';

export { ALL_ENTITY_TYPES_VALUE };

export function useAuditLogsQuery(page: number, entityType: string) {
  return useQuery({
    queryKey: queryKeys.auditLogs.list(page, entityType),
    queryFn: () => getAuditLogs({ page, entityType: entityType === ALL_ENTITY_TYPES_VALUE ? undefined : entityType }),
    staleTime: 15_000,
  });
}
