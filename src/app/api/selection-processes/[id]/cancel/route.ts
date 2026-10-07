import { proxyHandler } from '@/lib/http/proxy-handler';

export const PATCH = proxyHandler({
  method: 'patch',
  path: ({ id }) => `/selection-processes/${id}/cancel`,
  errorMessage: 'Não foi possível cancelar o processo seletivo.',
});
