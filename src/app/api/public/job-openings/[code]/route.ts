import { proxyHandler } from '@/lib/http/proxy-handler';

export const GET = proxyHandler({
  method: 'get',
  path: ({ code }) => `/public/job-openings/${code}`,
  errorMessage: 'Não foi possível carregar os detalhes da vaga.',
  public: true,
});
