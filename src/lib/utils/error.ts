import { isAxiosError } from 'axios';

export const DEFAULT_ERROR_MESSAGE = 'Não foi possível concluir esta ação.';

export function extractErrorMessage(error: unknown, fallbackMessage = DEFAULT_ERROR_MESSAGE): string {
  if (isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? fallbackMessage;
  }

  return fallbackMessage;
}
