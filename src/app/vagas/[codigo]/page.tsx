import type { Metadata } from 'next';
import { PublicJobOpeningView } from '@/features/public-job-opening/components/PublicJobOpeningView';

export const metadata: Metadata = {
  title: 'Vaga · Orm',
};

export default async function PublicJobOpeningPage({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params;

  return <PublicJobOpeningView code={codigo} />;
}
