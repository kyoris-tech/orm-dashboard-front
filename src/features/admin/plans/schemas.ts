import { z } from 'zod';
import { optionalPositiveIntegerText, requiredText } from '@/lib/validation/fields';

export const planFormSchema = z.object({
  name: requiredText('Informe o nome do plano.'),
  maxUsersText: optionalPositiveIntegerText,
  maxResumesText: optionalPositiveIntegerText,
  features: z.array(z.enum(['jobOpenings', 'selectionProcesses', 'reports'])),
});
