import dayjs from 'dayjs';
import type { SelectionProcessSummary } from '@/types/selection-process';
import type { MetricsBarItem, RecentHireItem, RecruitmentMetricsSummary } from './types';

const TOP_JOB_OPENINGS_LIMIT = 6;
const RECENT_HIRES_LIMIT = 5;

function average(values: number[]): number | null {
  if (values.length === 0) {
    return null;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function ratio(count: number, total: number): number | null {
  if (total === 0) {
    return null;
  }

  return Math.round((count / total) * 100);
}

export function computeRecruitmentMetrics(processes: SelectionProcessSummary[]): RecruitmentMetricsSummary {
  const totalProcesses = processes.length;
  const openProcesses = processes.filter((process) => process.status === 'OPEN').length;
  const closedProcesses = processes.filter((process) => process.status === 'CLOSED').length;
  const cancelledProcesses = processes.filter((process) => process.status === 'CANCELLED').length;
  const concludedProcesses = processes.filter((process) => process.status === 'CONCLUDED').length;

  const candidateCounts = processes.map((process) => process._count.candidates);

  const timeToHireDays = processes
    .filter((process) => process.status === 'CONCLUDED' && process.concludedAt)
    .map((process) => dayjs(process.concludedAt).diff(dayjs(process.createdAt), 'day'));

  const jobOpeningCandidateCounts = new Map<string, number>();

  for (const process of processes) {
    if (!process.jobOpening) {
      continue;
    }

    const current = jobOpeningCandidateCounts.get(process.jobOpening.title) ?? 0;
    jobOpeningCandidateCounts.set(process.jobOpening.title, current + process._count.candidates);
  }

  const topJobOpenings: MetricsBarItem[] = Array.from(jobOpeningCandidateCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, TOP_JOB_OPENINGS_LIMIT)
    .map(([label, count]) => ({ label, count }));

  const recentHires: RecentHireItem[] = processes
    .filter((process) => process.status === 'CONCLUDED' && process.selectedResume && process.concludedAt)
    .sort((a, b) => dayjs(b.concludedAt).valueOf() - dayjs(a.concludedAt).valueOf())
    .slice(0, RECENT_HIRES_LIMIT)
    .map((process) => ({
      processId: process.id,
      processName: process.name,
      candidateName: process.selectedResume?.dataJson?.fullName ?? process.selectedResume?.fullName ?? 'N/A',
      jobOpeningTitle: process.jobOpening?.title ?? null,
      concludedAt: process.concludedAt as string,
    }));

  return {
    totalProcesses,
    openProcesses,
    closedProcesses,
    cancelledProcesses,
    concludedProcesses,
    conversionRate: ratio(concludedProcesses, totalProcesses),
    cancellationRate: ratio(cancelledProcesses, totalProcesses),
    averageCandidatesPerProcess: average(candidateCounts),
    averageTimeToHireDays: average(timeToHireDays),
    topJobOpenings,
    recentHires,
  };
}
