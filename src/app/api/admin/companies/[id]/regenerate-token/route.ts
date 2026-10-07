import { proxyHandler } from '@/lib/http/proxy-handler';

export const POST = proxyHandler({
  method: 'post',
  path: ({ id }) => `/companies/${id}/regenerate-token`,
  errorMessage: 'Não foi possível gerar um novo token.',
});
