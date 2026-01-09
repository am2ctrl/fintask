import { z } from 'zod';

// Enums
export const TransactionTypeSchema = z.enum(['income', 'expense']);
export const TransactionModeSchema = z.enum(['avulsa', 'parcelada']);

// Schema base (sem refine)
const baseTransactionSchema = z.object({
  date: z.string().datetime({ message: 'Data deve estar no formato ISO 8601' }),
  amount: z.number().positive({ message: 'Valor deve ser positivo' }),
  type: TransactionTypeSchema,
  categoryId: z.string().uuid({ message: 'ID de categoria inválido' }),
  name: z.string().min(1, { message: 'Nome é obrigatório' }).max(100, { message: 'Nome deve ter no máximo 100 caracteres' }),
  description: z.string().max(500, { message: 'Descrição deve ter no máximo 500 caracteres' }).optional().nullable(),
  mode: TransactionModeSchema.optional().default('avulsa'),
  installmentNumber: z.number().int().positive().optional().nullable(),
  installmentsTotal: z.number().int().positive().optional().nullable(),
  cardId: z.string().uuid().optional().nullable(),
  familyMemberId: z.string().uuid().optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
  isPaid: z.boolean().optional().default(false),
  isRecurring: z.boolean().optional().default(false),
  recurringMonths: z.number().int().positive().optional().nullable(),
});

// Schema para criar transação (com validação de parcelamento)
export const createTransactionSchema = baseTransactionSchema.refine(
  (data) => {
    if (data.mode === 'parcelada') {
      return data.installmentNumber != null && data.installmentsTotal != null;
    }
    return true;
  },
  {
    message: 'Transações parceladas devem ter número e total de parcelas',
    path: ['mode'],
  }
);

// Schema para atualizar transação (todos campos opcionais)
export const updateTransactionSchema = baseTransactionSchema.partial();

// Schema para batch
export const batchTransactionsSchema = z.object({
  transactions: z.array(createTransactionSchema).min(1, {
    message: 'Pelo menos uma transação é necessária'
  }),
});

// Schema para parâmetro :id
export const transactionIdSchema = z.object({
  id: z.string().uuid({ message: 'ID de transação inválido' }),
});

// Tipos inferidos
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type BatchTransactionsInput = z.infer<typeof batchTransactionsSchema>;
