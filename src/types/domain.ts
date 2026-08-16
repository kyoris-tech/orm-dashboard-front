export type Status = 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'PENDING' | 'DELETED';

export type RoleName = 'admin' | 'mod' | 'recruiter';

export interface Company {
  id: string;
  name: string;
  email: string;
  status: Status;
  createdAt: string;
  updatedAt: string;
}

export interface Resume {
  id: string;
  fileName: string;
  fullName: string | null;
  email: string | null;
  confidence: number | null;
  processingMs: number | null;
  costBrl: number | null;
  dataJson: Record<string, unknown> | null;
  companyId: string;
  createdById: string | null;
  createdAt: string;
  deletedAt: string | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  status: Status;
  companyId: string;
  role: RoleName;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  oldValue: string | null;
  newValue: string | null;
  performedByUserId: string;
  performedByName: string;
  createdAt: string;
}
