import { proxyHandler } from '@/lib/http/proxy-handler';

export const GET = proxyHandler({
  method: 'get',
  path: '/public/job-openings',
  errorMessage: 'Não foi possível carregar as vagas.',
  public: true,
});
