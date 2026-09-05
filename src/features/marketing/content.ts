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
  priceLabel: string;
  pricePeriodLabel?: string;
  maxUsersLabel: string;
  maxResumesLabel: string;
  overageLabel: string;
  ctaLabel: string;
  features: PlanFeature[];
  highlighted?: boolean;
}

export const PLAN_COPY: readonly PlanCopy[] = [
  {
    name: 'Essencial',
    tagline: 'Para consultorias pequenas e RH de uma pessoa começarem a organizar as contratações.',
    priceLabel: 'R$ 197',
    pricePeriodLabel: '/mês',
    maxUsersLabel: 'Até 3 usuários',
    maxResumesLabel: '100 currículos inclusos por mês',
    overageLabel: 'Excedente: R$ 1,50 por currículo',
    ctaLabel: 'Assinar Plano',
    features: [],
  },
  {
    name: 'Profissional',
    tagline: 'Para empresas que já publicam vagas e tocam processos seletivos completos.',
    priceLabel: 'R$ 597',
    pricePeriodLabel: '/mês',
    maxUsersLabel: 'Até 15 usuários',
    maxResumesLabel: '600 currículos inclusos por mês',
    overageLabel: 'Excedente: R$ 0,90 por currículo',
    ctaLabel: 'Assinar Plano',
    features: ['jobOpenings', 'selectionProcesses', 'reports'],
    highlighted: true,
  },
  {
    name: 'Business',
    tagline: 'Para operações com contratação contínua e time sem limite de usuários.',
    priceLabel: 'R$ 1.497',
    pricePeriodLabel: '/mês',
    maxUsersLabel: 'Usuários ilimitados',
    maxResumesLabel: '2.000 currículos inclusos por mês',
    overageLabel: 'Excedente: R$ 0,60 por currículo',
    ctaLabel: 'Assinar Plano',
    features: ['jobOpenings', 'selectionProcesses', 'reports'],
  },
  {
    name: 'Enterprise',
    tagline: 'Para volume alto ou para usar a Orm como motor de inteligência artificial via API.',
    priceLabel: 'Sob consulta',
    maxUsersLabel: 'Usuários ilimitados',
    maxResumesLabel: 'Volume de currículos negociado',
    overageLabel: 'Excedente a partir de R$ 0,30 por currículo',
    ctaLabel: 'Falar com a equipe',
    features: ['jobOpenings', 'selectionProcesses', 'reports'],
  },
];

export const ALL_PLAN_FEATURES: readonly PlanFeature[] = Object.keys(FEATURE_LABELS) as PlanFeature[];
