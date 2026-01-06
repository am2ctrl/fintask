import { z } from 'zod';

export const RelationshipSchema = z.enum([
  'spouse', 'child', 'parent', 'sibling', 'other'
]);

export const createFamilyMemberSchema = z.object({
  name: z.string().min(1, { message: 'Nome é obrigatório' }),
  relationship: RelationshipSchema,
});

export const updateFamilyMemberSchema = createFamilyMemberSchema.partial();

export const familyMemberIdSchema = z.object({
  id: z.string().uuid(),
});

export type CreateFamilyMemberInput = z.infer<typeof createFamilyMemberSchema>;
export type UpdateFamilyMemberInput = z.infer<typeof updateFamilyMemberSchema>;
