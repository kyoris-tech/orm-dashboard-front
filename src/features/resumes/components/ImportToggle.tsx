'use client';

import { SegmentedControl, type SegmentedControlOption } from '@/components/ui/SegmentedControl';

export type HomeSection = 'import' | 'analyze' | 'proccess' | 'jobOpenings';

export interface ImportToggleProps {
  active: HomeSection;
  onChange: (value: HomeSection) => void;
}

const OPTIONS: readonly SegmentedControlOption<HomeSection>[] = [
  { key: 'import', label: 'Importar Arquivos' },
  { key: 'analyze', label: 'Analisar Candidatos' },
  { key: 'proccess', label: 'Processos Seletivos' },
  { key: 'jobOpenings', label: 'Vagas Publicadas' },
];

export function ImportToggle({ active, onChange }: ImportToggleProps) {
  return <SegmentedControl options={OPTIONS} active={active} onChange={onChange} />;
}
