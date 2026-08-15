import type { Metadata } from 'next';
import { MetricsView } from '@/features/metrics/components/MetricsView';
import { PageContainer } from '@/components/layout/PageContainer';

export const metadata: Metadata = {
  title: 'Métricas · Orm',
};

export default function MetricsPage() {
  return (
    <PageContainer>
      <MetricsView />
    </PageContainer>
  );
}
