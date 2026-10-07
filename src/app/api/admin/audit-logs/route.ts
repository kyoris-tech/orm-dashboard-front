import { proxyHandler } from '@/lib/http/proxy-handler';

export const GET = proxyHandler({
  method: 'get',
  path: '/admin/audit-logs',
  errorMessage: 'Não foi possível carregar o log de auditoria.',
  query: true,
});
