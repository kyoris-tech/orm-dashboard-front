import { proxyHandler } from '@/lib/http/proxy-handler';

export const GET = proxyHandler({
  method: 'get',
  path: '/companies/me/plan',
  errorMessage: 'Não foi possível carregar as informações do plano.',
});
