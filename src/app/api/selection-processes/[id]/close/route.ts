import { proxyHandler } from '@/lib/http/proxy-handler';

export const PATCH = proxyHandler({
  method: 'patch',
  path: ({ id }) => `/selection-processes/${id}/close`,
  errorMessage: 'Não foi possível fechar o processo seletivo.',
});
