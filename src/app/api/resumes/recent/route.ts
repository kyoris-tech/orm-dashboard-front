import { proxyHandler } from '@/lib/http/proxy-handler';

export const GET = proxyHandler({
  method: 'get',
  path: '/resumes/recent',
  errorMessage: 'Não foi possível carregar os currículos recentes.',
});
