import { z } from 'zod';

export const CardTypeSchema = z.enum(['mastercard', 'visa', 'elo', 'amex', 'other']);
export const CardHolderSchema = z.enum(['holder_main', 'holder_additional']);
export const CardPurposeSchema = z.enum(['personal', 'business']);

export const createCardSchema = z.object({
  name: z.string().min(1, { message: 'Nome é obrigatório' }),
  lastFourDigits: z.string().regex(/^\d{4}$/, {
    message: 'Últimos 4 dígitos devem conter exatamente 4 números'
  }),
  cardType: CardTypeSchema,
  holder: CardHolderSchema,
  purpose: CardPurposeSchema,
  color: z.string().regex(/^#[0-9A-F]{6}$/i),
  icon: z.string().optional().nullable(),
  limit: z.number().positive().optional().nullable(),
  closingDay: z.number().int().min(1).max(31).optional().nullable(),
  dueDay: z.number().int().min(1).max(31).optional().nullable(),
});

export const updateCardSchema = createCardSchema.partial();

export const cardIdSchema = z.object({
  id: z.string().uuid(),
});

export type CreateCardInput = z.infer<typeof createCardSchema>;
export type UpdateCardInput = z.infer<typeof updateCardSchema>;
