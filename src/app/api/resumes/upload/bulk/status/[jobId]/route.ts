import { proxyHandler } from '@/lib/http/proxy-handler';

export const GET = proxyHandler({
  method: 'get',
  path: ({ jobId }) => `/resumes/upload/bulk/status/${jobId}`,
  errorMessage: 'Não foi possível consultar o status do processamento.',
});
