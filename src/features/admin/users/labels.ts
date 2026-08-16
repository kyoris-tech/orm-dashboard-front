import type { RoleName, Status } from '@/types/domain';
import type { SelectOption } from '@/components/ui/Select';

export const ROLE_LABELS: Record<RoleName, string> = {
  admin: 'Administrador',
  mod: 'Moderador',
  recruiter: 'Recrutador',
};

export const ROLE_OPTIONS: SelectOption[] = [
  { value: 'admin', label: ROLE_LABELS.admin },
  { value: 'mod', label: ROLE_LABELS.mod },
  { value: 'recruiter', label: ROLE_LABELS.recruiter },
];

export const USER_STATUS_LABELS: Record<Status, string> = {
  ACTIVE: 'Ativo',
  INACTIVE: 'Inativo',
  BLOCKED: 'Bloqueado',
  PENDING: 'Pendente',
  DELETED: 'Excluído',
};

export const USER_STATUS_TONES: Record<Status, 'neutral' | 'success' | 'danger'> = {
  ACTIVE: 'success',
  INACTIVE: 'neutral',
  BLOCKED: 'danger',
  PENDING: 'neutral',
  DELETED: 'danger',
};
