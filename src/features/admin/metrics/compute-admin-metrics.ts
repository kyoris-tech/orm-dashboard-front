import dayjs from 'dayjs';
import type { CompanySummary } from '@/types/company';
import type { UserSummary } from '@/types/user';
import type { AdminMetricsSummary, AdminResumeRecord, CompanyMetricsRow, MetricsBarItem } from './types';

const TOP_SKILLS_LIMIT = 8;
const EDUCATION_LIMIT = 6;
const COMPANY_BREAKDOWN_LIMIT = 10;

function average(values: number[]): number | null {
  if (values.length === 0) {
    return null;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

function countBy(values: string[]): Map<string, number> {
  const counts = new Map<string, number>();

  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return counts;
}

function topEntries(counts: Map<string, number>, limit: number): MetricsBarItem[] {
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, count]) => ({ label, count }));
}

function buildCompanyBreakdown(resumes: AdminResumeRecord[]): CompanyMetricsRow[] {
  const byCompany = new Map<string, { companyName: string; resumes: AdminResumeRecord[] }>();

  for (const resume of resumes) {
    const companyId = resume.companyId ?? resume.company?.id ?? 'unknown';
    const companyName = resume.company?.name ?? 'N/A';
    const entry = byCompany.get(companyId) ?? { companyName, resumes: [] };
    entry.resumes.push(resume);
    byCompany.set(companyId, entry);
  }

  return Array.from(byCompany.entries())
    .map(([companyId, { companyName, resumes: companyResumes }]) => {
      const costValues = companyResumes.map((resume) => resume.costBrl).filter((value): value is number => typeof value === 'number');
      const confidenceValues = companyResumes
        .map((resume) => resume.confidence)
        .filter((value): value is number => typeof value === 'number');
      const processingValues = companyResumes
        .map((resume) => resume.processingMs)
        .filter((value): value is number => typeof value === 'number');

      const averageConfidenceRatio = average(confidenceValues);
      const averageProcessingMs = average(processingValues);

      return {
        companyId,
        companyName,
        totalResumes: companyResumes.length,
        totalCostBrl: sum(costValues),
        averageCostBrl: costValues.length === 0 ? null : sum(costValues) / costValues.length,
        averageConfidence: averageConfidenceRatio === null ? null : Math.round(averageConfidenceRatio * 100),
        averageProcessingSeconds: averageProcessingMs === null ? null : Math.round(averageProcessingMs / 100) / 10,
      };
    })
    .sort((a, b) => b.totalResumes - a.totalResumes);
}

export function computeAdminMetrics(
  allResumes: AdminResumeRecord[],
  companies: CompanySummary[],
  users: UserSummary[],
  periodDays: number,
): AdminMetricsSummary {
  const periodStart = dayjs().subtract(periodDays - 1, 'day').startOf('day');
  const resumes = allResumes.filter((resume) => !dayjs(resume.createdAt).isBefore(periodStart));

  const confidenceValues = resumes.map((resume) => resume.confidence).filter((value): value is number => typeof value === 'number');
  const processingValues = resumes.map((resume) => resume.processingMs).filter((value): value is number => typeof value === 'number');
  const costValues = resumes.map((resume) => resume.costBrl).filter((value): value is number => typeof value === 'number');

  const averageConfidenceRatio = average(confidenceValues);
  const averageProcessingMs = average(processingValues);
  const totalCostBrl = sum(costValues);

  const dayBuckets = new Map<string, number>();

  for (let offset = periodDays - 1; offset >= 0; offset -= 1) {
    dayBuckets.set(dayjs().subtract(offset, 'day').format('YYYY-MM-DD'), 0);
  }

  for (const resume of resumes) {
    const key = dayjs(resume.createdAt).format('YYYY-MM-DD');

    if (dayBuckets.has(key)) {
      dayBuckets.set(key, (dayBuckets.get(key) ?? 0) + 1);
    }
  }

  const importsByDay = Array.from(dayBuckets.entries()).map(([key, count]) => ({
    label: dayjs(key).format('DD/MM'),
    count,
  }));

  const skillCounts = countBy(resumes.flatMap((resume) => (resume.dataJson?.skills ?? []).map((skill) => skill.trim()).filter(Boolean)));

  const educationCounts = countBy(
    resumes.map((resume) => resume.dataJson?.education?.[0]?.course?.trim()).filter((value): value is string => Boolean(value)),
  );

  const companyBreakdown = buildCompanyBreakdown(resumes);

  const resumesByCompany = companyBreakdown
    .slice(0, COMPANY_BREAKDOWN_LIMIT)
    .map((row) => ({ label: row.companyName, count: row.totalResumes }));

  const nonDeletedCompanies = companies.filter((company) => company.status !== 'DELETED');
  const nonDeletedUsers = users.filter((user) => user.status !== 'DELETED');

  return {
    totalResumes: resumes.length,
    totalCostBrl,
    averageCostBrl: costValues.length === 0 ? null : totalCostBrl / costValues.length,
    averageConfidence: averageConfidenceRatio === null ? null : Math.round(averageConfidenceRatio * 100),
    averageProcessingSeconds: averageProcessingMs === null ? null : Math.round(averageProcessingMs / 100) / 10,
    importsByDay,
    topSkills: topEntries(skillCounts, TOP_SKILLS_LIMIT),
    educationBreakdown: topEntries(educationCounts, EDUCATION_LIMIT),
    resumesByCompany,
    companyBreakdown,
    totalCompanies: nonDeletedCompanies.length,
    activeCompanies: nonDeletedCompanies.filter((company) => company.status === 'ACTIVE').length,
    blockedCompanies: nonDeletedCompanies.filter((company) => company.status === 'BLOCKED').length,
    totalUsers: nonDeletedUsers.length,
    activeUsers: nonDeletedUsers.filter((user) => user.status === 'ACTIVE').length,
    blockedUsers: nonDeletedUsers.filter((user) => user.status === 'BLOCKED').length,
  };
}
