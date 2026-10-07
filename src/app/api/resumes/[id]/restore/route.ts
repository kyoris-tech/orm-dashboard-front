import { proxyHandler } from '@/lib/http/proxy-handler';

export const PATCH = proxyHandler({
  method: 'patch',
  path: ({ id }) => `/resumes/${id}/restore`,
  errorMessage: 'Não foi possível restaurar o currículo.',
});
