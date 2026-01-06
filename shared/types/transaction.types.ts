/**
 * Tipos relacionados a Transações
 */

export type TransactionMode = "avulsa" | "parcelada";
export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  userId: string;
  date: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  description: string;
  mode: TransactionMode;
  installmentNumber: number | null;
  installmentsTotal: number | null;
  cardId: string | null;
  familyMemberId: string | null;
  createdAt: string;
}

export interface CreateTransactionInput {
  date: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  description: string;
  mode?: TransactionMode;
  installmentNumber?: number | null;
  installmentsTotal?: number | null;
  cardId?: string | null;
  familyMemberId?: string | null;
}

export interface UpdateTransactionInput extends Partial<CreateTransactionInput> {}
