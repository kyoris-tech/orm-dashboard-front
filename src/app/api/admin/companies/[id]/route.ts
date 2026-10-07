import { proxyHandler } from '@/lib/http/proxy-handler';

export const PATCH = proxyHandler({
  method: 'patch',
  path: ({ id }) => `/companies/${id}`,
  errorMessage: 'Não foi possível atualizar a empresa.',
  body: true,
});
