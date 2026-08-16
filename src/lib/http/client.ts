import axios from 'axios';

export const httpClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = typeof error?.config?.url === 'string' ? error.config.url : '';
    const isAuthEndpoint = requestUrl.startsWith('/auth/');

    if (typeof window !== 'undefined' && error?.response?.status === 401 && !isAuthEndpoint) {
      window.location.href = '/login';
    }

    return Promise.reject(error);
  },
);
