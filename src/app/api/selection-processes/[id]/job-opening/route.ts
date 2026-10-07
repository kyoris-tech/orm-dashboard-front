import { proxyHandler } from '@/lib/http/proxy-handler';

export const PATCH = proxyHandler({
  method: 'patch',
  path: ({ id }) => `/selection-processes/${id}/job-opening`,
  errorMessage: 'Não foi possível vincular a vaga ao processo.',
  body: true,
});
