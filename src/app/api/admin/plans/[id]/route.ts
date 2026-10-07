import { proxyHandler } from '@/lib/http/proxy-handler';

export const PATCH = proxyHandler({
  method: 'patch',
  path: ({ id }) => `/admin/plans/${id}`,
  errorMessage: 'Não foi possível atualizar o plano.',
  body: true,
});

export const DELETE = proxyHandler({
  method: 'delete',
  path: ({ id }) => `/admin/plans/${id}`,
  errorMessage: 'Não foi possível excluir o plano.',
  respond: (_data, { id }) => ({ id }),
});
