/**
 * Tipos relacionados a Membros da Família
 */

export type Relationship = "self" | "spouse" | "child" | "parent" | "other";

export interface FamilyMember {
  id: string;
  userId: string;
  name: string;
  relationship: Relationship;
  createdAt: string;
}

export interface CreateFamilyMemberInput {
  name: string;
  relationship: Relationship;
}

export interface UpdateFamilyMemberInput extends Partial<CreateFamilyMemberInput> {}
