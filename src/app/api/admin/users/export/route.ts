import { proxyHandler } from '@/lib/http/proxy-handler';

export const GET = proxyHandler({
  method: 'get',
  path: '/users/export',
  errorMessage: 'Não foi possível exportar os usuários.',
});
