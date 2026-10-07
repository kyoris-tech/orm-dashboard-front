import { proxyHandler } from '@/lib/http/proxy-handler';

export const PATCH = proxyHandler({
  method: 'patch',
  path: ({ id }) => `/job-openings/${id}/cancel`,
  errorMessage: 'Não foi possível cancelar a vaga.',
});
