import type { Metadata } from 'next';
import { HomeView } from './home-view';

export const metadata: Metadata = {
  title: 'Início · Orm',
  description: 'Importe currículos, analise candidatos e gerencie vagas e processos seletivos na Orm Intelligence.',
  robots: { index: false, follow: false },
};

export default function HomePage() {
  return <HomeView />;
}
