import type { RoleName, Status } from './domain';

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  status: Status;
  companyId: string;
  company: { id: string; name: string } | null;
  role: { id: string; name: RoleName };
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  companyId: string;
  role: RoleName;
}

export interface UserExportRecord {
  id: string;
  name: string;
  email: string;
  status: Status;
  companyId: string;
  companyName: string | null;
  role: RoleName | null;
  createdAt: string;
  updatedAt: string;
  blockedAt: string | null;
  blockedBy: string | null;
  deletedAt: string | null;
  deletedBy: string | null;
}
