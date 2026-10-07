import type { ContractType, JobOpeningStatus, JobOpeningVisibility, WorkModel } from '@/types/job-opening';

export const WORK_MODEL_LABELS: Record<WorkModel, string> = {
  REMOTE: 'Remoto',
  HYBRID: 'Híbrido',
  ONSITE: 'Presencial',
};

export const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
  CLT: 'CLT',
  PJ: 'Pessoa Jurídica (PJ)',
  INTERNSHIP: 'Estágio',
  TEMPORARY: 'Temporário',
};

export const WORK_MODEL_OPTIONS = Object.entries(WORK_MODEL_LABELS).map(([value, label]) => ({ value, label }));

export const CONTRACT_TYPE_OPTIONS = Object.entries(CONTRACT_TYPE_LABELS).map(([value, label]) => ({ value, label }));

export const JOB_OPENING_STATUS_LABELS: Record<JobOpeningStatus, string> = {
  OPEN: 'Aberta',
  CLOSED: 'Fechada',
  CANCELLED: 'Cancelada',
};

export const JOB_OPENING_STATUS_TONES: Record<JobOpeningStatus, 'neutral' | 'success' | 'danger' | 'accent'> = {
  OPEN: 'success',
  CLOSED: 'neutral',
  CANCELLED: 'danger',
};

export const JOB_OPENING_VISIBILITY_LABELS: Record<JobOpeningVisibility, string> = {
  PUBLIC: 'Pública',
  PRIVATE: 'Privada',
};

export const JOB_OPENING_VISIBILITY_DESCRIPTIONS: Record<JobOpeningVisibility, string> = {
  PUBLIC: 'Aparece na página de vagas do site e pode ser encontrada no Google. Qualquer pessoa pode se candidatar.',
  PRIVATE: 'Não aparece na página de vagas nem nas buscas. Só quem receber o link consegue ver e se candidatar.',
};

export const JOB_OPENING_VISIBILITY_TONES: Record<JobOpeningVisibility, 'neutral' | 'success' | 'danger' | 'accent'> = {
  PUBLIC: 'accent',
  PRIVATE: 'neutral',
};
