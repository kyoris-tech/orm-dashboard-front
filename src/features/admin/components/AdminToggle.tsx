'use client';

import { SegmentedControl, type SegmentedControlOption } from '@/components/ui/SegmentedControl';

export type AdminSection = 'companies' | 'users' | 'metrics';

export interface AdminToggleProps {
  active: AdminSection;
  onChange: (value: AdminSection) => void;
}

const OPTIONS: readonly SegmentedControlOption<AdminSection>[] = [
  { key: 'companies', label: 'Empresas' },
  { key: 'users', label: 'Usuários' },
  { key: 'metrics', label: 'Métricas' },
];

export function AdminToggle({ active, onChange }: AdminToggleProps) {
  return <SegmentedControl options={OPTIONS} active={active} onChange={onChange} />;
}
