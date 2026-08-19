import type { ResumeListItem } from './resumes';
import type { JobOpeningStatus } from './job-opening';

export type SelectionProcessStatus = 'OPEN' | 'CLOSED' | 'CANCELLED' | 'CONCLUDED';

export interface SelectionProcessJobOpeningRef {
  id: string;
  title: string;
  status: JobOpeningStatus;
}

export interface SelectionProcessSelectedResumeRef {
  id: string;
  fullName: string;
  dataJson?: { fullName?: string } | null;
}

export interface SelectionProcessSummary {
  id: string;
  name: string;
  status: SelectionProcessStatus;
  createdAt: string;
  closedAt: string | null;
  cancelledAt: string | null;
  concludedAt: string | null;
  jobOpening: SelectionProcessJobOpeningRef | null;
  selectedResume: SelectionProcessSelectedResumeRef | null;
  _count: {
    candidates: number;
  };
}

export interface SelectionProcessCandidateEntry {
  id: string;
  resumeId: string;
  addedAt: string;
  matchScore: number | null;
  resume: ResumeListItem;
}

export interface SelectionProcessDetail extends SelectionProcessSummary {
  candidates: SelectionProcessCandidateEntry[];
}

export interface CreateSelectionProcessInput {
  name: string;
  resumeIds: string[];
  jobOpeningId?: string;
}
