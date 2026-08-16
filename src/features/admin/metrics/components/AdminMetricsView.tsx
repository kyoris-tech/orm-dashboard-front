'use client';

import { useMemo, useState } from 'react';
import { Building2, Coins, Download, FileText, Gauge, Timer, Users } from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { ImportsTimelineChart } from '@/components/ui/charts/ImportsTimelineChart';
import { RankedBarChart } from '@/components/ui/charts/RankedBarChart';
import { Text } from '@/components/ui/Text';
import { Toast } from '@/components/ui/Toast';
import { Select } from '@/components/ui/Select';
import { useAdminResumesQuery } from '../hooks/use-admin-resumes-query';
import { useCompaniesQuery } from '../../companies/hooks/use-companies-query';
import { useUsersQuery } from '../../users/hooks/use-users-query';
import { computeAdminMetrics } from '../compute-admin-metrics';
import { exportAdminMetricsToCsv } from '../export';

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 4 });
}

const PERIOD_OPTIONS = [
  { value: '7', label: 'Última semana' },
  { value: '15', label: 'Últimos 15 dias' },
  { value: '30', label: 'Último mês' },
];

export function AdminMetricsView() {
  const resumesQuery = useAdminResumesQuery();
  const companiesQuery = useCompaniesQuery();
  const usersQuery = useUsersQuery();
  const [exportError, setExportError] = useState<string | null>(null);
  const [periodDays, setPeriodDays] = useState(15);

  const isLoading = resumesQuery.isLoading || companiesQuery.isLoading || usersQuery.isLoading;
  const isError = resumesQuery.isError || companiesQuery.isError || usersQuery.isError;

  const metrics = useMemo(() => {
    if (!resumesQuery.data || !companiesQuery.data || !usersQuery.data) {
      return null;
    }

    return computeAdminMetrics(resumesQuery.data, companiesQuery.data, usersQuery.data, periodDays);
  }, [resumesQuery.data, companiesQuery.data, usersQuery.data, periodDays]);

  function handleExport() {
    if (!metrics) {
      return;
    }

    try {
      exportAdminMetricsToCsv(metrics);
    } catch {
      setExportError('Não foi possível exportar as métricas.');
    }
  }

  if (isLoading) {
    return (
      <Text variant="body" muted>
        Carregando métricas...
      </Text>
    );
  }

  if (isError || !metrics) {
    return (
      <Text variant="body" muted>
        Não foi possível carregar as métricas.
      </Text>
    );
  }

  return (
    <div className="w-full flex flex-col gap-8">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Text as="h1" variant="title">
          Métricas gerais
        </Text>

        <div className="flex items-center gap-3 flex-wrap">
          <Select
            options={PERIOD_OPTIONS}
            value={String(periodDays)}
            onChange={(event) => setPeriodDays(Number(event.target.value))}
            className="!h-11 min-w-[180px]"
          />

          <button
            type="button"
            onClick={handleExport}
            title="Exporta o consumo de IA e as métricas por empresa, no período selecionado, em CSV"
            className="flex items-center gap-2 px-4 py-2 text-sm rounded-full border border-border text-foreground hover:bg-surface-soft transition cursor-pointer"
          >
            <Download size={16} />
            Exportar relatório
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label={`Currículos importados (${periodDays} dias)`} value={String(metrics.totalResumes)} icon={FileText} />
        <StatCard label="Consumo total de IA" value={formatCurrency(metrics.totalCostBrl)} icon={Coins} />
        <StatCard
          label="Custo médio por currículo"
          value={metrics.averageCostBrl === null ? 'N/A' : formatCurrency(metrics.averageCostBrl)}
          icon={Coins}
        />
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
        <StatCard label="Empresas ativas" value={`${metrics.activeCompanies} / ${metrics.totalCompanies}`} icon={Building2} />
        <StatCard label="Usuários ativos" value={`${metrics.activeUsers} / ${metrics.totalUsers}`} icon={Users} />
        <StatCard label="Empresas bloqueadas" value={String(metrics.blockedCompanies)} icon={Building2} />
        <StatCard label="Usuários bloqueados" value={String(metrics.blockedUsers)} icon={Users} />
      </div>

      <div className="bg-surface border border-border rounded-2xl p-6">
        <Text variant="subtitle" className="mb-4">
          Importações nos últimos {periodDays} dias
        </Text>
        <ImportsTimelineChart points={metrics.importsByDay} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface border border-border rounded-2xl p-6">
          <Text variant="subtitle" className="mb-4">
            Currículos por empresa ({periodDays} dias)
          </Text>
          <RankedBarChart items={metrics.resumesByCompany} emptyMessage="Nenhum currículo importado ainda." />
        </div>

        <div className="bg-surface border border-border rounded-2xl p-6">
          <Text variant="subtitle" className="mb-4">
            Habilidades mais frequentes ({periodDays} dias)
          </Text>
          <RankedBarChart items={metrics.topSkills} emptyMessage="Nenhuma habilidade extraída ainda." />
        </div>

        <div className="bg-surface border border-border rounded-2xl p-6 md:col-span-2">
          <Text variant="subtitle" className="mb-4">
            Escolaridade dos candidatos ({periodDays} dias)
          </Text>
          <RankedBarChart items={metrics.educationBreakdown} emptyMessage="Nenhuma informação de escolaridade extraída ainda." />
        </div>
      </div>

      {exportError && <Toast message={exportError} onDismiss={() => setExportError(null)} />}
    </div>
  );
}
