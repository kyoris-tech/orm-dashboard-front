import type { Metadata } from 'next';
import { MetricsView } from '@/features/metrics/components/MetricsView';
import { PageContainer } from '@/components/layout/PageContainer';

export const metadata: Metadata = {
  title: 'Métricas · Orm',
  description: 'Acompanhe relatórios de recrutamento: volume de currículos, conversão e tempo até a contratação.',
  robots: { index: false, follow: false },
};

export default function MetricsPage() {
  return (
    <PageContainer>
      <MetricsView />
    </PageContainer>
  );
}
