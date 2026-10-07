import { proxyHandler } from '@/lib/http/proxy-handler';

export const GET = proxyHandler({
  method: 'get',
  path: '/job-openings',
  errorMessage: 'Não foi possível carregar as vagas.',
  query: true,
});

export const POST = proxyHandler({
  method: 'post',
  path: '/job-openings',
  errorMessage: 'Não foi possível cadastrar a vaga.',
  body: true,
});
