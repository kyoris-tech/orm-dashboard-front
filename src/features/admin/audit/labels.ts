export const ENTITY_TYPE_LABELS: Record<string, string> = {
  COMPANY: 'Empresa',
  USER: 'Usuário',
  JOB_OPENING: 'Vaga',
  SELECTION_PROCESS: 'Processo seletivo',
  PLAN: 'Plano',
  resume: 'Currículo',
};

export const ACTION_LABELS: Record<string, string> = {
  CREATE: 'Criação',
  UPDATE: 'Alteração',
  UPDATE_NAME: 'Alteração de nome',
  UPDATE_STATUS: 'Alteração de status',
  UPDATE_DETAILS: 'Alteração de dados cadastrais',
  REGENERATE_TOKEN: 'Regeneração de token',
  CANCEL: 'Cancelamento',
  CLOSE: 'Encerramento',
  CONCLUDE: 'Conclusão',
  AUTO_CLOSE: 'Encerramento automático',
  SOFT_DELETE: 'Exclusão',
  HARD_DELETE: 'Exclusão permanente',
  DELETE: 'Exclusão',
  RESTORE: 'Restauração',
  DOWNLOAD: 'Download',
  UPDATE_PLAN: 'Alteração de plano',
};

export function entityTypeLabel(entityType: string): string {
  return ENTITY_TYPE_LABELS[entityType] ?? entityType;
}

export function actionLabel(action: string): string {
  return ACTION_LABELS[action] ?? action;
}
