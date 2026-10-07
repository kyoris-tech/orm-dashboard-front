import type { ContractType, JobOpeningStatus, JobOpeningVisibility, WorkModel } from './job-opening';

export interface PublicJobOpening {
  title: string;
  companyName: string;
  workModel: WorkModel;
  contractType: ContractType;
  salaryRange: string | null;
  requirements: string[];
  differentials: string[];
  benefits: string[];
  status: JobOpeningStatus;
  visibility: JobOpeningVisibility;
  createdAt: string;
}

export interface PublicJobOpeningSummary {
  publicCode: string;
  title: string;
  companyName: string;
  workModel: WorkModel;
  contractType: ContractType;
  salaryRange: string | null;
  requirements: string[];
  createdAt: string;
}
