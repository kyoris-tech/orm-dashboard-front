import type { PaginationParams } from '@/types/pagination';

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
    list: (params: PaginationParams = {}) => [...queryKeys.selectionProcesses.all, 'list', params] as const,
    detail: (id: string) => [...queryKeys.selectionProcesses.all, 'detail', id] as const,
  },
  jobOpenings: {
    all: ['job-openings'] as const,
    list: (params: PaginationParams = {}) => [...queryKeys.jobOpenings.all, 'list', params] as const,
    detail: (id: string) => [...queryKeys.jobOpenings.all, 'detail', id] as const,
  },
  companies: {
    all: ['companies'] as const,
    list: (params: PaginationParams = {}) => [...queryKeys.companies.all, 'list', params] as const,
  },
  users: {
    all: ['users'] as const,
    list: (params: PaginationParams = {}) => [...queryKeys.users.all, 'list', params] as const,
  },
  auditLogs: {
    all: ['audit-logs'] as const,
    list: (params: PaginationParams & { entityType?: string } = {}) => [...queryKeys.auditLogs.all, 'list', params] as const,
  },
  plan: {
    all: ['plan'] as const,
    mine: () => [...queryKeys.plan.all, 'mine'] as const,
  },
  plans: {
    all: ['plans'] as const,
    list: (params: PaginationParams = {}) => [...queryKeys.plans.all, 'list', params] as const,
  },
  publicJobOpening: {
    all: ['public-job-opening'] as const,
    list: () => [...queryKeys.publicJobOpening.all, 'list'] as const,
    detail: (code: string) => [...queryKeys.publicJobOpening.all, 'detail', code] as const,
  },
};
