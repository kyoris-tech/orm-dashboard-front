import type { ResumeListItem } from './resumes';
import type { JobOpeningStatus } from './job-opening';

export type SelectionProcessStatus = 'OPEN' | 'CLOSED';

export interface SelectionProcessJobOpeningRef {
  id: string;
  title: string;
  status: JobOpeningStatus;
}

export interface SelectionProcessSummary {
  id: string;
  name: string;
  status: SelectionProcessStatus;
  createdAt: string;
  jobOpening: SelectionProcessJobOpeningRef | null;
  _count: {
    candidates: number;
  };
}

export interface SelectionProcessCandidateEntry {
  id: string;
  resumeId: string;
  addedAt: string;
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
