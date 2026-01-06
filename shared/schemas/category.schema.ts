import { z } from 'zod';

export const CategoryTypeSchema = z.enum(['income', 'expense']);

export const createCategorySchema = z.object({
  name: z.string().min(1, { message: 'Nome é obrigatório' }),
  type: CategoryTypeSchema,
  color: z.string().regex(/^#[0-9A-F]{6}$/i, { message: 'Cor deve ser hex válida' }),
  icon: z.string().optional().nullable(),
});

export const updateCategorySchema = createCategorySchema.partial();

export const categoryIdSchema = z.object({
  id: z.string().uuid(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
