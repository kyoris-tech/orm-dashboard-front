import axios from 'axios';
import { env } from '@/config/env';

export const backendClient = axios.create({
  baseURL: env.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': env.apiKey,
  },
});

export function withBearerToken(token: string) {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}
