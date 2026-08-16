import { buildCsv, downloadCsv } from '@/lib/utils/csv';
import { formatDateTime } from '@/lib/utils/date';
import type { AdminMetricsSummary } from './types';

const CSV_HEADERS = [
  'Empresa',
  'Currículos importados',
  'Custo total de IA (R$)',
  'Custo médio por currículo (R$)',
  'Confiança média (%)',
  'Tempo médio de processamento (s)',
];

export function exportAdminMetricsToCsv(metrics: AdminMetricsSummary): void {
  const rows = metrics.companyBreakdown.map((row) => ({
    'Empresa': row.companyName,
    'Currículos importados': row.totalResumes,
    'Custo total de IA (R$)': row.totalCostBrl.toFixed(4),
    'Custo médio por currículo (R$)': row.averageCostBrl === null ? '' : row.averageCostBrl.toFixed(4),
    'Confiança média (%)': row.averageConfidence ?? '',
    'Tempo médio de processamento (s)': row.averageProcessingSeconds ?? '',
  }));

  rows.push({
    'Empresa': 'TOTAL',
    'Currículos importados': metrics.totalResumes,
    'Custo total de IA (R$)': metrics.totalCostBrl.toFixed(4),
    'Custo médio por currículo (R$)': metrics.averageCostBrl === null ? '' : metrics.averageCostBrl.toFixed(4),
    'Confiança média (%)': metrics.averageConfidence ?? '',
    'Tempo médio de processamento (s)': metrics.averageProcessingSeconds ?? '',
  });

  const csvContent = buildCsv(CSV_HEADERS, rows);
  const fileNameSuffix = formatDateTime(new Date().toISOString()).replace(/[/: ]/g, '-');

  downloadCsv(`metricas-orm-${fileNameSuffix}.csv`, csvContent);
}
