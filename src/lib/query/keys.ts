export const queryKeys = {
  resumes: {
    all: ['resumes'] as const,
    recent: () => [...queryKeys.resumes.all, 'recent'] as const,
    list: <TFilters extends object>(filters: TFilters) => [...queryKeys.resumes.all, 'list', filters] as const,
    metricsSummary: () => [...queryKeys.resumes.all, 'metrics-summary'] as const,
    company: () => [...queryKeys.resumes.all, 'company'] as const,
    adminMetrics: () => [...queryKeys.resumes.all, 'admin-metrics'] as const,
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
  companies: {
    all: ['companies'] as const,
    list: () => [...queryKeys.companies.all, 'list'] as const,
  },
  users: {
    all: ['users'] as const,
    list: () => [...queryKeys.users.all, 'list'] as const,
  },
  auditLogs: {
    all: ['audit-logs'] as const,
    list: (page: number, entityType: string) => [...queryKeys.auditLogs.all, 'list', page, entityType] as const,
  },
  plan: {
    all: ['plan'] as const,
    mine: () => [...queryKeys.plan.all, 'mine'] as const,
  },
  plans: {
    all: ['plans'] as const,
    list: () => [...queryKeys.plans.all, 'list'] as const,
  },
  publicJobOpening: {
    all: ['public-job-opening'] as const,
    list: () => [...queryKeys.publicJobOpening.all, 'list'] as const,
    detail: (code: string) => [...queryKeys.publicJobOpening.all, 'detail', code] as const,
  },
};
