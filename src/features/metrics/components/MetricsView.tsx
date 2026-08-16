'use client';

import { FileText, Gauge, Timer } from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { ImportsTimelineChart } from '@/components/ui/charts/ImportsTimelineChart';
import { RankedBarChart } from '@/components/ui/charts/RankedBarChart';
import { Text } from '@/components/ui/Text';
import { useResumesMetricsQuery } from '../hooks/use-resumes-metrics-query';
import { RecruitmentMetricsSection } from './RecruitmentMetricsSection';
import { PlanFeatureGate } from '@/features/plan/components/PlanFeatureGate';

export function MetricsView() {
  const metricsQuery = useResumesMetricsQuery();

  if (metricsQuery.isLoading) {
    return (
      <Text variant="body" muted>
        Carregando métricas...
      </Text>
    );
  }

  if (metricsQuery.isError || !metricsQuery.data) {
    return (
      <Text variant="body" muted>
        Não foi possível carregar as métricas.
      </Text>
    );
  }

  const metrics = metricsQuery.data;

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">
      <Text as="h1" variant="title">
        Métricas
      </Text>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Currículos importados" value={String(metrics.totalResumes)} icon={FileText} />
        <StatCard
          label="Confiança média da extração"
          value={metrics.averageConfidence === null ? 'N/A' : `${metrics.averageConfidence}%`}
          icon={Gauge}
        />
        <StatCard
          label="Tempo médio de processamento"
          value={metrics.averageProcessingSeconds === null ? 'N/A' : `${metrics.averageProcessingSeconds}s`}
          icon={Timer}
        />
      </div>

      <div className="bg-surface border border-border rounded-2xl p-6">
        <Text variant="subtitle" className="mb-4">
          Importações nos últimos 14 dias
        </Text>
        <ImportsTimelineChart points={metrics.importsByDay} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface border border-border rounded-2xl p-6">
          <Text variant="subtitle" className="mb-4">
            Habilidades mais frequentes
          </Text>
          <RankedBarChart items={metrics.topSkills} emptyMessage="Nenhuma habilidade extraída ainda." />
        </div>

        <div className="bg-surface border border-border rounded-2xl p-6">
          <Text variant="subtitle" className="mb-4">
            Escolaridade dos candidatos
          </Text>
          <RankedBarChart items={metrics.educationBreakdown} emptyMessage="Nenhuma informação de escolaridade extraída ainda." />
        </div>
      </div>

      <PlanFeatureGate feature="reports">
        <RecruitmentMetricsSection />
      </PlanFeatureGate>
    </div>
  );
}
