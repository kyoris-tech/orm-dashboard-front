import { BrainCircuit, Briefcase, CircleFadingArrowUp, Workflow } from 'lucide-react';
import { FEATURE_LABELS } from '@/features/plan/labels';
import type { LucideIcon } from 'lucide-react';
import type { PlanFeature } from '@/types/company';

export interface CapabilityCopy {
  icon: LucideIcon;
  title: string;
  caption: string;
  description: string;
}

export const CAPABILITIES: readonly CapabilityCopy[] = [
  {
    icon: BrainCircuit,
    title: 'Analisar Candidatos',
    caption: 'Com inteligência artificial',
    description: 'Compare e avalie candidatos com inteligência artificial, direto na plataforma, sem planilhas paralelas.',
  },
  {
    icon: CircleFadingArrowUp,
    title: 'Importar Arquivos',
    caption: 'Em lote, PDF ou Word',
    description: 'Envie currículos em lote, em PDF ou Word, e deixe a Orm organizá-los automaticamente para sua equipe.',
  },
  {
    icon: Briefcase,
    title: 'Vagas Publicadas',
    caption: 'Com link público',
    description: 'Publique vagas com um link público e receba candidaturas organizadas automaticamente na plataforma.',
  },
  {
    icon: Workflow,
    title: 'Processos Seletivos',
    caption: 'Do início ao fim',
    description: 'Acompanhe cada etapa da contratação em um só lugar, do primeiro contato à contratação final.',
  },
];

export interface PlanCopy {
  name: string;
  tagline: string;
  maxUsersLabel: string;
  maxResumesLabel: string;
  features: PlanFeature[];
  highlighted?: boolean;
}

export const PLAN_COPY: readonly PlanCopy[] = [
  {
    name: 'Básico',
    tagline: 'Para times pequenos começarem a organizar suas contratações.',
    maxUsersLabel: 'Até 2 usuários',
    maxResumesLabel: 'Até 50 currículos por mês',
    features: [],
  },
  {
    name: 'Pro',
    tagline: 'Para empresas que já publicam vagas e tocam processos seletivos completos.',
    maxUsersLabel: 'Até 10 usuários',
    maxResumesLabel: 'Até 500 currículos por mês',
    features: ['jobOpenings', 'selectionProcesses', 'reports'],
    highlighted: true,
  },
  {
    name: 'Enterprise',
    tagline: 'Para operações de recrutamento em escala, sem limites de uso.',
    maxUsersLabel: 'Usuários ilimitados',
    maxResumesLabel: 'Currículos ilimitados',
    features: ['jobOpenings', 'selectionProcesses', 'reports'],
  },
];

export const ALL_PLAN_FEATURES: readonly PlanFeature[] = Object.keys(FEATURE_LABELS) as PlanFeature[];
