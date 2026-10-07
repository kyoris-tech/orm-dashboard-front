import { proxyHandler } from '@/lib/http/proxy-handler';

export const PATCH = proxyHandler({
  method: 'patch',
  path: ({ id }) => `/companies/${id}/status`,
  errorMessage: 'Não foi possível atualizar o status da empresa.',
  body: true,
});
