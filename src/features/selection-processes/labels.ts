import type { SelectionProcessStatus } from '@/types/selection-process';

export const SELECTION_PROCESS_STATUS_LABELS: Record<SelectionProcessStatus, string> = {
  OPEN: 'Em andamento',
  CLOSED: 'Fechado',
  CANCELLED: 'Cancelado',
  CONCLUDED: 'Concluído',
};

export const SELECTION_PROCESS_STATUS_TONES: Record<SelectionProcessStatus, 'neutral' | 'success' | 'danger' | 'accent'> = {
  OPEN: 'success',
  CLOSED: 'neutral',
  CANCELLED: 'danger',
  CONCLUDED: 'accent',
};
