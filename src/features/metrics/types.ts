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
