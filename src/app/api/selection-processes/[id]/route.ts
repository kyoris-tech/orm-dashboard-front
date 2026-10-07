import { proxyHandler } from '@/lib/http/proxy-handler';

export const GET = proxyHandler({
  method: 'get',
  path: ({ id }) => `/selection-processes/${id}`,
  errorMessage: 'Não foi possível carregar o processo seletivo.',
});
