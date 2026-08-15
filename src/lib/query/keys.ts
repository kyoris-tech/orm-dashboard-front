export const queryKeys = {
  resumes: {
    all: ['resumes'] as const,
    recent: () => [...queryKeys.resumes.all, 'recent'] as const,
    list: <TFilters extends object>(filters: TFilters) => [...queryKeys.resumes.all, 'list', filters] as const,
    metricsSummary: () => [...queryKeys.resumes.all, 'metrics-summary'] as const,
  },
  selectionProcesses: {
    all: ['selection-processes'] as const,
    list: () => [...queryKeys.selectionProcesses.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.selectionProcesses.all, 'detail', id] as const,
  },
  jobOpenings: {
    all: ['job-openings'] as const,
    list: () => [...queryKeys.jobOpenings.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.jobOpenings.all, 'detail', id] as const,
  },
};
