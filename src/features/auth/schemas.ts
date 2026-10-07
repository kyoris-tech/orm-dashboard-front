import { z } from 'zod';
import { emailField } from '@/lib/validation/fields';

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, 'Informe a senha.'),
});
