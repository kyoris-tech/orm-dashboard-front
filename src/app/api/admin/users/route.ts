import { proxyHandler } from '@/lib/http/proxy-handler';

export const GET = proxyHandler({
  method: 'get',
  path: '/users',
  errorMessage: 'Não foi possível carregar os usuários.',
  query: true,
});

export const POST = proxyHandler({
  method: 'post',
  path: '/users',
  errorMessage: 'Não foi possível cadastrar o usuário.',
  body: true,
});
