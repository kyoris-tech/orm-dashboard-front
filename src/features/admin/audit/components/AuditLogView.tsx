'use client';

import { useState } from 'react';
import { Select } from '@/components/ui/Select';
import { AuditLogTable } from './AuditLogTable';
import { ALL_ENTITY_TYPES_VALUE } from '../hooks/use-audit-logs-query';
import { ENTITY_TYPE_LABELS } from '../labels';

const ENTITY_TYPE_OPTIONS = [
  { value: ALL_ENTITY_TYPES_VALUE, label: 'Todas as entidades' },
  ...Object.entries(ENTITY_TYPE_LABELS).map(([value, label]) => ({ value, label })),
];

export function AuditLogView() {
  const [entityType, setEntityType] = useState(ALL_ENTITY_TYPES_VALUE);
  const [page, setPage] = useState(1);

  function handleEntityTypeChange(value: string) {
    setEntityType(value);
    setPage(1);
  }

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted whitespace-nowrap">Entidade</span>
        <Select
          options={ENTITY_TYPE_OPTIONS}
          value={entityType}
          onChange={(event) => handleEntityTypeChange(event.target.value)}
          className="!h-11 min-w-[220px]"
        />
      </div>

      <AuditLogTable page={page} entityType={entityType} onPageChange={setPage} />
    </div>
  );
}
