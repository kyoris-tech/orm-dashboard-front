import type { ResumeListItem } from '@/types/resumes';

export interface AdminResumeRecord extends ResumeListItem {
  costBrl?: number | null;
  companyId?: string;
  company?: { id: string; name: string } | null;
}

export interface MetricsBarItem {
  label: string;
  count: number;
}

export interface CompanyMetricsRow {
  companyId: string;
  companyName: string;
  totalResumes: number;
  totalCostBrl: number;
  averageCostBrl: number | null;
  averageConfidence: number | null;
  averageProcessingSeconds: number | null;
}

export interface AdminMetricsSummary {
  totalResumes: number;
  totalCostBrl: number;
  averageCostBrl: number | null;
  averageConfidence: number | null;
  averageProcessingSeconds: number | null;
  importsByDay: MetricsBarItem[];
  topSkills: MetricsBarItem[];
  educationBreakdown: MetricsBarItem[];
  resumesByCompany: MetricsBarItem[];
  companyBreakdown: CompanyMetricsRow[];
  totalCompanies: number;
  activeCompanies: number;
  blockedCompanies: number;
  totalUsers: number;
  activeUsers: number;
  blockedUsers: number;
}
