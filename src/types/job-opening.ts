export type WorkModel = 'REMOTE' | 'HYBRID' | 'ONSITE';
export type ContractType = 'CLT' | 'PJ' | 'INTERNSHIP' | 'TEMPORARY';
export type JobOpeningStatus = 'OPEN' | 'CLOSED' | 'CANCELLED';

export interface JobOpeningSummary {
  id: string;
  title: string;
  workModel: WorkModel;
  contractType: ContractType;
  salaryRange: string | null;
  requirements: string[];
  differentials: string[];
  status: JobOpeningStatus;
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
  salaryRange?: string;
  requirements: string[];
  differentials: string[];
}
