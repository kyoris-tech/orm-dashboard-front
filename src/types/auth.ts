import type { RoleName } from './domain';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  companyId: string;
  companyName: string;
  role: RoleName;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: {
    id: string;
    name: string;
    email: string;
    company_id: string;
    company_name: string;
    role: RoleName;
  };
}
