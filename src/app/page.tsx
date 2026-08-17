import type { Metadata } from 'next';
import { LandingView } from '@/features/marketing/components/LandingView';

const TITLE = 'Orm Intelligence — Recrutamento com triagem de currículos por IA';
const DESCRIPTION =
  'A Orm Intelligence é a plataforma de recrutamento operada pela Kyoris Tech: importe currículos, publique vagas e conduza processos seletivos com triagem por inteligência artificial, de ponta a ponta.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    'recrutamento',
    'triagem de currículos',
    'inteligência artificial',
    'IA para RH',
    'processos seletivos',
    'vagas de emprego',
    'recrutamento e seleção',
    'Orm Intelligence',
    'Kyoris Tech',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: '/',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function RootPage() {
  return <LandingView />;
}
