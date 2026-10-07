import { proxyHandler } from '@/lib/http/proxy-handler';

export const GET = proxyHandler({
  method: 'get',
  path: '/admin/plans',
  errorMessage: 'Não foi possível carregar os planos.',
  query: true,
});

export const POST = proxyHandler({
  method: 'post',
  path: '/admin/plans',
  errorMessage: 'Não foi possível criar o plano.',
  body: true,
});
