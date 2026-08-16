import dayjs from 'dayjs';
import type { ResumeListItem } from '@/types/resumes';
import type { MetricsBarItem, MetricsSummary } from './types';

const TIMELINE_DAYS = 14;
const TOP_SKILLS_LIMIT = 8;
const EDUCATION_LIMIT = 6;

function average(values: number[]): number | null {
  if (values.length === 0) {
    return null;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
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

export function computeMetrics(resumes: ResumeListItem[]): MetricsSummary {
  const confidenceValues = resumes
    .map((resume) => resume.confidence)
    .filter((value): value is number => typeof value === 'number');

  const processingValues = resumes
    .map((resume) => resume.processingMs)
    .filter((value): value is number => typeof value === 'number');

  const averageConfidenceRatio = average(confidenceValues);
  const averageProcessingMs = average(processingValues);

  const dayBuckets = new Map<string, number>();

  for (let offset = TIMELINE_DAYS - 1; offset >= 0; offset -= 1) {
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

  return {
    totalResumes: resumes.length,
    averageConfidence: averageConfidenceRatio === null ? null : Math.round(averageConfidenceRatio * 100),
    averageProcessingSeconds: averageProcessingMs === null ? null : Math.round(averageProcessingMs / 100) / 10,
    importsByDay,
    topSkills: topEntries(skillCounts, TOP_SKILLS_LIMIT),
    educationBreakdown: topEntries(educationCounts, EDUCATION_LIMIT),
  };
}
