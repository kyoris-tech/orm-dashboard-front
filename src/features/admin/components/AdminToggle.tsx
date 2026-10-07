'use client';

import { SegmentedControl, type SegmentedControlOption } from '@/components/ui/SegmentedControl';
import { useSectionParam } from '@/lib/hooks/use-section-param';

export type AdminSection = 'companies' | 'users' | 'metrics' | 'audit' | 'plans';

const OPTIONS: readonly SegmentedControlOption<AdminSection>[] = [
  { key: 'companies', label: 'Empresas' },
  { key: 'users', label: 'Usuários' },
  { key: 'metrics', label: 'Métricas' },
  { key: 'audit', label: 'Auditoria' },
  { key: 'plans', label: 'Planos' },
];

const SECTION_KEYS = OPTIONS.map((option) => option.key);

export function useAdminSection() {
  return useSectionParam<AdminSection>(SECTION_KEYS, 'companies');
}

export function AdminToggle({ leading, joinedBelow }: { leading?: React.ReactNode; joinedBelow?: boolean }) {
  const [section, setSection] = useAdminSection();

  return <SegmentedControl options={OPTIONS} active={section} onChange={setSection} compact leading={leading} joinedBelow={joinedBelow} />;
}
