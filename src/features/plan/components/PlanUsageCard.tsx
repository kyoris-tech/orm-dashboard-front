'use client';

import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { useMyPlanQuery } from '../hooks/use-my-plan-query';

function UsageBar({ label, used, limit }: { label: string; used: number; limit: number | null }) {
  const percentage = limit === null ? 0 : Math.min(100, Math.round((used / limit) * 100));
  const isNearLimit = limit !== null && used >= limit;

  return (
    <div className="flex flex-col gap-1.5 flex-1 min-w-[160px]">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted">{label}</span>
        <span className={isNearLimit ? 'text-danger font-medium' : 'text-foreground font-medium'}>
          {used} {limit === null ? '' : `/ ${limit}`}
        </span>
      </div>

      <div className="h-1.5 w-full rounded-full bg-surface-soft overflow-hidden">
        {limit !== null && (
          <div
            className={isNearLimit ? 'h-full rounded-full bg-danger' : 'h-full rounded-full bg-accent'}
            style={{ width: `${percentage}%` }}
          />
        )}
        {limit === null && <div className="h-full rounded-full bg-success" style={{ width: '100%' }} />}
      </div>
    </div>
  );
}

export function PlanUsageCard() {
  const planQuery = useMyPlanQuery();

  if (planQuery.isLoading) {
    return (
      <div className="w-full bg-surface border border-border rounded-2xl p-5 flex items-center justify-center h-[88px]">
        <Loader2 className="animate-spin text-accent" size={18} />
      </div>
    );
  }

  if (planQuery.isError || !planQuery.data) {
    return null;
  }

  const usage = planQuery.data;

  return (
    <div className="w-full bg-surface border border-border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs text-muted whitespace-nowrap">Plano</span>
        <Badge tone="accent">{usage.label}</Badge>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 flex-1">
        <UsageBar label="Usuários ativos" used={usage.users.used} limit={usage.users.limit} />
        <UsageBar label="Currículos este mês" used={usage.resumes.used} limit={usage.resumes.limit} />
      </div>
    </div>
  );
}
