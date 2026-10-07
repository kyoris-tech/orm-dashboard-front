import { proxyHandler } from '@/lib/http/proxy-handler';

export const PATCH = proxyHandler({
  method: 'patch',
  path: ({ id }) => `/users/${id}/status`,
  errorMessage: 'Não foi possível atualizar o status do usuário.',
  body: true,
});
