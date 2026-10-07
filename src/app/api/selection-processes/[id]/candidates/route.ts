import { proxyHandler } from '@/lib/http/proxy-handler';

export const POST = proxyHandler({
  method: 'post',
  path: ({ id }) => `/selection-processes/${id}/candidates`,
  errorMessage: 'Não foi possível adicionar candidatos ao processo.',
  body: true,
});
