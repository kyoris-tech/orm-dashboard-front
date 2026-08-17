import type { Metadata } from 'next';
import { PublicJobOpeningsListView } from '@/features/public-job-opening/components/PublicJobOpeningsListView';

const TITLE = 'Vagas abertas · Orm';
const DESCRIPTION = 'Veja as vagas abertas nas empresas que recrutam pela Orm Intelligence e candidate-se enviando seu currículo, sem precisar criar conta.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: '/vagas',
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: '/vagas',
    type: 'website',
  },
};

export default function PublicJobOpeningsPage() {
  return <PublicJobOpeningsListView />;
}
