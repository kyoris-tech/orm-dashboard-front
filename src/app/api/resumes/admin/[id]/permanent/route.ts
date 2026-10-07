import { proxyHandler } from '@/lib/http/proxy-handler';

export const DELETE = proxyHandler({
  method: 'delete',
  path: ({ id }) => `/resumes/admin/${id}/permanent`,
  errorMessage: 'Não foi possível excluir permanentemente o currículo.',
});
