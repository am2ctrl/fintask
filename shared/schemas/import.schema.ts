import { z } from 'zod';

export const StatementTypeSchema = z.enum([
  'bradesco_credit',
  'bradesco_debit',
  'inter_credit',
  'nubank_credit',
]);

export const extractTransactionsSchema = z.object({
  text: z.string().min(1, { message: 'Texto do extrato é obrigatório' }),
  statementType: StatementTypeSchema,
});

export type ExtractTransactionsInput = z.infer<typeof extractTransactionsSchema>;
