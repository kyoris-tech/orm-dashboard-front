import { OverviewSection } from './components/sections/OverviewSection';
import { AccessSection } from './components/sections/AccessSection';
import { AreasSection } from './components/sections/AreasSection';
import { ImportSection } from './components/sections/ImportSection';
import { CandidatesSection } from './components/sections/CandidatesSection';
import { ProcessesSection } from './components/sections/ProcessesSection';
import { JobOpeningsSection } from './components/sections/JobOpeningsSection';
import { ReportsSection } from './components/sections/ReportsSection';
import { AdminSection } from './components/sections/AdminSection';
import { PlansSection } from './components/sections/PlansSection';
import { FaqSection } from './components/sections/FaqSection';
import type { ManualSectionDefinition } from './types';

const MANUAL_SECTIONS: ManualSectionDefinition[] = [
  { id: 'visao-geral', title: 'O que é a Orm', navLabel: 'O que é a Orm', Content: OverviewSection },
  { id: 'acesso', title: 'Entrar no sistema', navLabel: 'Entrar no sistema', Content: AccessSection },
  { id: 'areas', title: 'As quatro áreas do Início', navLabel: 'As quatro áreas', Content: AreasSection },
  { id: 'importar', title: 'Importar currículos', navLabel: 'Importar currículos', Content: ImportSection },
  { id: 'candidatos', title: 'Analisar candidatos', navLabel: 'Analisar candidatos', Content: CandidatesSection },
  { id: 'processos', title: 'Processos seletivos', navLabel: 'Processos seletivos', Content: ProcessesSection },
  { id: 'vagas', title: 'Vagas publicadas', navLabel: 'Vagas publicadas', Content: JobOpeningsSection },
  { id: 'relatorios', title: 'Relatórios', navLabel: 'Relatórios', Content: ReportsSection },
  { id: 'administracao', title: 'Administração', navLabel: 'Administração', adminOnly: true, Content: AdminSection },
  { id: 'planos', title: 'Planos e limites', navLabel: 'Planos e limites', Content: PlansSection },
  { id: 'duvidas', title: 'Dúvidas frequentes', navLabel: 'Dúvidas frequentes', Content: FaqSection },
];

export function getManualSections(isAdmin: boolean): ManualSectionDefinition[] {
  return MANUAL_SECTIONS.filter((section) => !section.adminOnly || isAdmin);
}
