import { z } from 'zod';
import { countDigits, emailField, requiredId, requiredText } from '@/lib/validation/fields';

const CNPJ_DIGITS = 14;

const billingDayText = z
  .string()
  .trim()
  .refine((value) => value === '' || (/^\d+$/.test(value) && Number(value) >= 1 && Number(value) <= 31), 'Informe um dia entre 1 e 31.');

const companyDetails = {
  phone: z.string(),
  address: z.string(),
  website: z.string(),
  segment: z.string(),
  contactName: z.string(),
  billingDayText,
};

export const createCompanySchema = z.object({
  name: requiredText('Informe o nome da empresa (mínimo de 2 caracteres).', 2),
  email: emailField,
  cnpj: z
    .string()
    .trim()
    .min(1, 'Informe o CNPJ.')
    .refine((value) => countDigits(value) === CNPJ_DIGITS, 'O CNPJ deve ter 14 dígitos.'),
  planId: requiredId('Selecione o plano.'),
  ...companyDetails,
});

export const editCompanySchema = z.object({
  name: requiredText('Informe o nome da empresa (mínimo de 2 caracteres).', 2),
  cnpj: z
    .string()
    .trim()
    .refine((value) => value === '' || countDigits(value) === CNPJ_DIGITS, 'O CNPJ deve ter 14 dígitos.'),
  planId: z.string(),
  ...companyDetails,
});
