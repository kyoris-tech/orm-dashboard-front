import { z } from 'zod';
import { requiredText } from '@/lib/validation/fields';

export const jobOpeningFormSchema = z
  .object({
    title: requiredText('Informe o título da vaga.'),
    workModel: z.enum(['REMOTE', 'HYBRID', 'ONSITE']),
    contractType: z.enum(['CLT', 'PJ', 'INTERNSHIP', 'TEMPORARY']),
    visibility: z.enum(['PUBLIC', 'PRIVATE']),
    salaryMin: z.number().min(0, 'Informe um valor válido.').optional(),
    salaryMax: z.number().min(0, 'Informe um valor válido.').optional(),
    requirements: z.array(z.string()),
    differentials: z.array(z.string()),
    benefits: z.array(z.string()),
  })
  .refine((values) => values.salaryMin === undefined || values.salaryMax === undefined || values.salaryMin <= values.salaryMax, {
    path: ['salaryMax'],
    message: 'O salário máximo não pode ser menor que o mínimo.',
  });
