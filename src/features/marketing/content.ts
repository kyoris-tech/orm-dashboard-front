import { BrainCircuit, Briefcase, CircleFadingArrowUp, Workflow } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

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

export interface PricedPlanCopy {
  name: string;
  tagline: string;
  analysesPerMonth: number;
  priceMonthly: number;
  priceAnnual: number;
}

export const PRICED_PLANS: readonly PricedPlanCopy[] = [
  {
    name: 'Easy',
    tagline: 'Para pequenas empresas ou contratação autônoma.',
    analysesPerMonth: 100,
    priceMonthly: 79.9,
    priceAnnual: 59.9,
  },
  {
    name: 'Company',
    tagline: 'Para médias empresas com média de 300 funcionários.',
    analysesPerMonth: 250,
    priceMonthly: 119.9,
    priceAnnual: 89.9,
  },
  {
    name: 'Business',
    tagline: 'Para grandes empresas com até 1.000 funcionários.',
    analysesPerMonth: 500,
    priceMonthly: 159.9,
    priceAnnual: 129.9,
  },
];

export const ENTERPRISE_PLAN = {
  name: 'Enterprise',
  pricePerAnalysis: 2.9,
  minAnalyses: 500,
};
