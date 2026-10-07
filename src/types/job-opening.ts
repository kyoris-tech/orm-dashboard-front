export type WorkModel = 'REMOTE' | 'HYBRID' | 'ONSITE';
export type ContractType = 'CLT' | 'PJ' | 'INTERNSHIP' | 'TEMPORARY';
export type JobOpeningStatus = 'OPEN' | 'CLOSED' | 'CANCELLED';
export type JobOpeningVisibility = 'PUBLIC' | 'PRIVATE';

export interface JobOpeningSummary {
  id: string;
  title: string;
  workModel: WorkModel;
  contractType: ContractType;
  salaryRange: string | null;
  requirements: string[];
  differentials: string[];
  benefits: string[];
  status: JobOpeningStatus;
  visibility: JobOpeningVisibility;
  publicCode: string;
  createdAt: string;
  _count: {
    selectionProcesses: number;
  };
}

export interface JobOpeningSelectionProcessRef {
  id: string;
  name: string;
  status: 'OPEN' | 'CLOSED';
  createdAt: string;
  _count: {
    candidates: number;
  };
}

export interface JobOpeningDetail extends JobOpeningSummary {
  selectionProcesses: JobOpeningSelectionProcessRef[];
}

export interface CreateJobOpeningInput {
  title: string;
  workModel: WorkModel;
  contractType: ContractType;
  visibility: JobOpeningVisibility;
  salaryRange?: string;
  requirements: string[];
  differentials: string[];
  benefits: string[];
}

export type UpdateJobOpeningInput = CreateJobOpeningInput;
