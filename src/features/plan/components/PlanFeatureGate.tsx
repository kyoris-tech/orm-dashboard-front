'use client';

import { Loader2, Lock } from 'lucide-react';
import { useMyPlanQuery } from '../hooks/use-my-plan-query';
import { FEATURE_LABELS } from '../labels';
import type { PlanFeature } from '@/types/company';

export interface PlanFeatureGateProps {
  feature: PlanFeature;
  children: React.ReactNode;
}

export function PlanFeatureGate({ feature, children }: PlanFeatureGateProps) {
  const planQuery = useMyPlanQuery();

  if (planQuery.isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="animate-spin text-accent" size={24} />
      </div>
    );
  }

  if (planQuery.isError || !planQuery.data || planQuery.data.features.includes(feature)) {
    return <>{children}</>;
  }

  return (
    <div className="w-full max-w-xl mx-auto bg-surface border border-border rounded-2xl p-10 flex flex-col items-center text-center gap-3">
      <span className="bg-surface-soft text-accent rounded-full p-3">
        <Lock size={22} />
      </span>
      <h3 className="text-lg font-semibold text-foreground">{FEATURE_LABELS[feature]} não está disponível no plano {planQuery.data.label}</h3>
      <p className="text-sm text-muted">Fale com a Kyoris para fazer upgrade de plano e liberar este recurso para sua empresa.</p>
    </div>
  );
}
