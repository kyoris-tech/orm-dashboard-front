import { proxyHandler } from '@/lib/http/proxy-handler';

export const DELETE = proxyHandler({
  method: 'delete',
  path: ({ id }) => `/resumes/${id}`,
  errorMessage: 'Falha ao deletar o currículo.',
});
