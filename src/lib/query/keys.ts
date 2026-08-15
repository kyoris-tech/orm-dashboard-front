export const queryKeys = {
  resumes: {
    all: ['resumes'] as const,
    recent: () => [...queryKeys.resumes.all, 'recent'] as const,
    list: <TFilters extends object>(filters: TFilters) => [...queryKeys.resumes.all, 'list', filters] as const,
    metricsSummary: () => [...queryKeys.resumes.all, 'metrics-summary'] as const,
  },
};
