import { z } from 'zod';

export const requiredText = (message: string, minLength = 1) => z.string().trim().min(minLength, message);

export const requiredId = (message: string) => z.string().min(1, message);

export const emailField = z.string().trim().min(1, 'Informe o e-mail.').pipe(z.email('Informe um e-mail válido.'));

export const optionalPositiveIntegerText = z
  .string()
  .trim()
  .refine((value) => value === '' || (/^\d+$/.test(value) && Number(value) >= 1), 'Informe um número inteiro maior que zero ou deixe vazio.');

export function countDigits(value: string): number {
  return value.replace(/\D/g, '').length;
}
