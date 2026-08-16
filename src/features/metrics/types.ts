export interface MetricsBarItem {
  label: string;
  count: number;
}

export interface MetricsSummary {
  totalResumes: number;
  averageConfidence: number | null;
  averageProcessingSeconds: number | null;
  importsByDay: MetricsBarItem[];
  topSkills: MetricsBarItem[];
  educationBreakdown: MetricsBarItem[];
}

export interface RecentHireItem {
  processId: string;
  processName: string;
  candidateName: string;
  jobOpeningTitle: string | null;
  concludedAt: string;
}

export interface RecruitmentMetricsSummary {
  totalProcesses: number;
  openProcesses: number;
  closedProcesses: number;
  cancelledProcesses: number;
  concludedProcesses: number;
  conversionRate: number | null;
  cancellationRate: number | null;
  averageCandidatesPerProcess: number | null;
  averageTimeToHireDays: number | null;
  topJobOpenings: MetricsBarItem[];
  recentHires: RecentHireItem[];
}
