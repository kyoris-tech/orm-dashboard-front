'use client';

import { SegmentedControl, type SegmentedControlOption } from '@/components/ui/SegmentedControl';

export type AdminSection = 'companies' | 'users' | 'metrics' | 'audit' | 'plans';

export interface AdminToggleProps {
  active: AdminSection;
  onChange: (value: AdminSection) => void;
}

const OPTIONS: readonly SegmentedControlOption<AdminSection>[] = [
  { key: 'companies', label: 'Empresas' },
  { key: 'users', label: 'Usuários' },
  { key: 'metrics', label: 'Métricas' },
  { key: 'audit', label: 'Auditoria' },
  { key: 'plans', label: 'Planos' },
];

export function AdminToggle({ active, onChange }: AdminToggleProps) {
  return <SegmentedControl options={OPTIONS} active={active} onChange={onChange} />;
}
