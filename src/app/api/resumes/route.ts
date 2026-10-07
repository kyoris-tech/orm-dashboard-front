import { proxyHandler } from '@/lib/http/proxy-handler';

export const GET = proxyHandler({
  method: 'get',
  path: '/resumes',
  errorMessage: 'Não foi possível carregar os currículos.',
  query: true,
});
