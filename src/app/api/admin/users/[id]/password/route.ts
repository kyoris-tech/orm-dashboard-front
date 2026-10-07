import { proxyHandler } from '@/lib/http/proxy-handler';

export const PATCH = proxyHandler({
  method: 'patch',
  path: ({ id }) => `/users/${id}/password`,
  errorMessage: 'Não foi possível redefinir a senha do usuário.',
  body: true,
});
