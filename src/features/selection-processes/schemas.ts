import { z } from 'zod';
import { requiredId, requiredText } from '@/lib/validation/fields';

export const createSelectionProcessSchema = z.object({
  name: requiredText('Informe o nome do processo seletivo.'),
  jobOpeningId: z.string(),
});

export const linkJobOpeningSchema = z.object({
  jobOpeningId: requiredId('Selecione uma vaga.'),
});

export const addCandidatesSchema = z.object({
  resumeIds: z.array(z.string()).min(1, 'Selecione ao menos um candidato.'),
});

export const concludeSelectionProcessSchema = z.object({
  resumeId: requiredId('Selecione o candidato escolhido.'),
});
