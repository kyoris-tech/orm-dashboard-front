import { proxyHandler } from '@/lib/http/proxy-handler';

export const GET = proxyHandler({
  method: 'get',
  path: '/companies',
  errorMessage: 'Não foi possível carregar as empresas.',
  query: true,
});

export const POST = proxyHandler({
  method: 'post',
  path: '/companies',
  errorMessage: 'Não foi possível cadastrar a empresa.',
  body: true,
});
