'use client';

import { Award, Ban, CheckCircle2, Clock, ListChecks, Users } from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { RankedBarChart } from '@/components/ui/charts/RankedBarChart';
import { Badge } from '@/components/ui/Badge';
import { Text } from '@/components/ui/Text';
import { formatDate } from '@/lib/utils/date';
import { useRecruitmentMetricsQuery } from '../hooks/use-recruitment-metrics-query';

export function RecruitmentMetricsSection() {
  const recruitmentMetricsQuery = useRecruitmentMetricsQuery();

  if (recruitmentMetricsQuery.isLoading) {
    return (
      <Text variant="body" muted>
        Carregando métricas de processos seletivos...
      </Text>
    );
  }

  if (recruitmentMetricsQuery.isError || !recruitmentMetricsQuery.data) {
    return (
      <Text variant="body" muted>
        Não foi possível carregar as métricas de processos seletivos.
      </Text>
    );
  }

  const metrics = recruitmentMetricsQuery.data;

  return (
    <div className="w-full flex flex-col gap-8">
      <Text as="h2" variant="subtitle">
        Processos seletivos e candidatos
      </Text>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Processos seletivos abertos" value={String(metrics.totalProcesses)} icon={ListChecks} />
        <StatCard
          label="Taxa de conversão (contratações)"
          value={metrics.conversionRate === null ? 'N/A' : `${metrics.conversionRate}%`}
          icon={CheckCircle2}
        />
        <StatCard
          label="Tempo médio até a contratação"
          value={metrics.averageTimeToHireDays === null ? 'N/A' : `${metrics.averageTimeToHireDays} dia(s)`}
          icon={Clock}
        />
        <StatCard
          label="Candidatos por processo (média)"
          value={metrics.averageCandidatesPerProcess === null ? 'N/A' : metrics.averageCandidatesPerProcess.toFixed(1)}
          icon={Users}
        />
        <StatCard
          label="Taxa de cancelamento"
          value={metrics.cancellationRate === null ? 'N/A' : `${metrics.cancellationRate}%`}
          icon={Ban}
        />
        <StatCard label="Contratações concluídas" value={String(metrics.concludedProcesses)} icon={Award} />
      </div>

      <div className="bg-surface border border-border rounded-2xl p-6">
        <Text variant="subtitle" className="mb-4">
          Processos por status
        </Text>

        <div className="flex flex-wrap gap-3">
          <Badge tone="success">Em andamento: {metrics.openProcesses}</Badge>
          <Badge tone="neutral">Fechados: {metrics.closedProcesses}</Badge>
          <Badge tone="danger">Cancelados: {metrics.cancelledProcesses}</Badge>
          <Badge tone="accent">Concluídos: {metrics.concludedProcesses}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface border border-border rounded-2xl p-6">
          <Text variant="subtitle" className="mb-4">
            Vagas com mais candidatos
          </Text>
          <RankedBarChart items={metrics.topJobOpenings} emptyMessage="Nenhuma vaga vinculada a processos seletivos ainda." />
        </div>

        <div className="bg-surface border border-border rounded-2xl p-6">
          <Text variant="subtitle" className="mb-4">
            Últimas contratações
          </Text>

          {metrics.recentHires.length === 0 ? (
            <p className="text-sm text-muted">Nenhum processo concluído ainda.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {metrics.recentHires.map((hire) => (
                <div key={hire.processId} className="flex items-center justify-between gap-3 border border-border rounded-xl px-4 py-3">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">{hire.candidateName}</span>
                    <span className="text-xs text-muted">
                      {hire.jobOpeningTitle ?? hire.processName} · {formatDate(hire.concludedAt)}
                    </span>
                  </div>
                  <Badge tone="accent">Contratado</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
