import { proxyHandler } from '@/lib/http/proxy-handler';

export const PATCH = proxyHandler({
  method: 'patch',
  path: ({ id }) => `/companies/${id}/plan`,
  errorMessage: 'Não foi possível atualizar o plano da empresa.',
  body: true,
});
