import { proxyHandler } from '@/lib/http/proxy-handler';

export const GET = proxyHandler({
  method: 'get',
  path: '/selection-processes',
  errorMessage: 'Não foi possível carregar os processos seletivos.',
  query: true,
});

export const POST = proxyHandler({
  method: 'post',
  path: '/selection-processes',
  errorMessage: 'Não foi possível abrir o processo seletivo.',
  body: true,
});
