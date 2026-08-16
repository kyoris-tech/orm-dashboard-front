export type CompanyStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'PENDING' | 'DELETED';

export interface CompanySummary {
  id: string;
  name: string;
  email: string;
  apiKey: string;
  status: CompanyStatus;
  createdAt: string;
  updatedAt: string;
}
