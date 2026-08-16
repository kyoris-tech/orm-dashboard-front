export type CompanyStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'PENDING' | 'DELETED';
export type PlanFeature = 'jobOpenings' | 'selectionProcesses' | 'reports';

export interface Plan {
  id: string;
  name: string;
  maxUsers: number | null;
  maxResumesPerMonth: number | null;
  features: PlanFeature[];
  createdAt: string;
  updatedAt: string;
  companyCount?: number;
}

export interface CreatePlanInput {
  name: string;
  maxUsers: number | null;
  maxResumesPerMonth: number | null;
  features: PlanFeature[];
}

export type UpdatePlanInput = Partial<CreatePlanInput>;

export interface CompanySummary {
  id: string;
  name: string;
  email: string;
  apiKey: string;
  cnpj: string | null;
  phone: string | null;
  address: string | null;
  website: string | null;
  segment: string | null;
  contactName: string | null;
  billingDay: number | null;
  status: CompanyStatus;
  planId: string;
  plan: Plan;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCompanyInput {
  name: string;
  email: string;
  cnpj: string;
  planId: string;
  phone?: string;
  address?: string;
  website?: string;
  segment?: string;
  contactName?: string;
  billingDay?: number;
}

export interface UpdateCompanyInput {
  name: string;
  cnpj?: string;
  planId?: string;
  phone?: string;
  address?: string;
  website?: string;
  segment?: string;
  contactName?: string;
  billingDay?: number | null;
}

export interface PlanUsage {
  plan: string;
  label: string;
  features: PlanFeature[];
  users: { used: number; limit: number | null };
  resumes: { used: number; limit: number | null; periodStart: string };
}
