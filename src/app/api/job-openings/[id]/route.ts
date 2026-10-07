import { proxyHandler } from '@/lib/http/proxy-handler';

export const GET = proxyHandler({
  method: 'get',
  path: ({ id }) => `/job-openings/${id}`,
  errorMessage: 'Não foi possível carregar os detalhes da vaga.',
});

export const PATCH = proxyHandler({
  method: 'patch',
  path: ({ id }) => `/job-openings/${id}`,
  errorMessage: 'Não foi possível salvar as alterações da vaga.',
  body: true,
});
