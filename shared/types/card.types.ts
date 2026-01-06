/**
 * Tipos relacionados a Cartões de Crédito
 */

export interface CreditCard {
  id: string;
  userId: string;
  name: string;
  lastFourDigits: string;
  holderFamilyMemberId: string | null;
  createdAt: string;
}

export interface CreateCreditCardInput {
  name: string;
  lastFourDigits: string;
  holderFamilyMemberId?: string | null;
}

export interface UpdateCreditCardInput extends Partial<CreateCreditCardInput> {}
