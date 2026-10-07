import { z } from 'zod';
import { emailField, requiredId, requiredText } from '@/lib/validation/fields';

const MIN_PASSWORD_LENGTH = 6;

const passwordField = z
  .string()
  .refine((value) => value.trim().length >= MIN_PASSWORD_LENGTH, `A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`);

export const createUserSchema = z.object({
  name: requiredText('Informe o nome do usuário.'),
  email: emailField,
  password: passwordField,
  companyId: requiredId('Selecione a empresa.'),
  role: z.enum(['admin', 'mod', 'recruiter']),
});

export const changePasswordSchema = z.object({
  password: passwordField,
});
