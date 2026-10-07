import { proxyHandler } from '@/lib/http/proxy-handler';

export const PATCH = proxyHandler({
  method: 'patch',
  path: ({ id }) => `/selection-processes/${id}/conclude`,
  errorMessage: 'Não foi possível concluir o processo seletivo.',
  body: true,
});
