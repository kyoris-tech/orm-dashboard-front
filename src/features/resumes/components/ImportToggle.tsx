'use client';

import { SegmentedControl, type SegmentedControlOption } from '@/components/ui/SegmentedControl';
import { useSectionParam } from '@/lib/hooks/use-section-param';

export type HomeSection = 'import' | 'analyze' | 'proccess' | 'jobOpenings';

const OPTIONS: readonly SegmentedControlOption<HomeSection>[] = [
  { key: 'import', label: 'Importar Arquivos' },
  { key: 'analyze', label: 'Analisar Candidatos' },
  { key: 'proccess', label: 'Processos Seletivos' },
  { key: 'jobOpenings', label: 'Vagas Publicadas' },
];

const SECTION_KEYS = OPTIONS.map((option) => option.key);

export function useHomeSection() {
  return useSectionParam<HomeSection>(SECTION_KEYS, 'import');
}

export function ImportToggle({ leading, joinedBelow }: { leading?: React.ReactNode; joinedBelow?: boolean }) {
  const [section, setSection] = useHomeSection();

  return <SegmentedControl options={OPTIONS} active={section} onChange={setSection} compact leading={leading} joinedBelow={joinedBelow} />;
}
