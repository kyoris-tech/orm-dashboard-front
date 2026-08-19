import type { ContractType, JobOpeningStatus, WorkModel } from './job-opening';

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
