import type { PlanFeature } from '@/types/company';

export const FEATURE_LABELS: Record<PlanFeature, string> = {
  jobOpenings: 'Vagas publicadas',
  selectionProcesses: 'Processos seletivos',
  reports: 'Relatórios',
};

export const FEATURE_OPTIONS = Object.entries(FEATURE_LABELS).map(([value, label]) => ({
  value: value as PlanFeature,
  label,
}));
