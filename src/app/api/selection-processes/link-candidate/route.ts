import { proxyHandler } from '@/lib/http/proxy-handler';

export const POST = proxyHandler({
  method: 'post',
  path: '/selection-processes/link-candidate',
  errorMessage: 'Não foi possível vincular o candidato à vaga.',
  body: true,
});
