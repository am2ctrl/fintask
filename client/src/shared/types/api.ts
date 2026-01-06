/**
 * Tipos de resposta da API
 * Centraliza interfaces usadas nas comunicações com o backend
 */

export type TransactionMode = "avulsa" | "recorrente" | "parcelada";

export interface ApiCategory {
  id: string;
  name: string;
  type: "income" | "expense";
  color: string;
  icon: string;
  user_id: string | null;
  created_at: string;
}

export interface ApiFamilyMember {
  id: string;
  user_id: string;
  name: string;
  relationship: "self" | "spouse" | "child" | "other";
  is_primary: boolean;
  created_at: string;
}

export interface ApiTransaction {
  id: string;
  date: string;
  amount: number;
  type: "income" | "expense";
  category_id: string;
  description: string;
  mode: TransactionMode;
  installment_number: number | null;
  installments_total: number | null;
  card_id: string | null;
  family_member_id: string | null;
  user_id: string | null;
  created_at: string;
}

export interface ApiCreditCard {
  id: string;
  name: string;
  last_four_digits: string;
  card_type: "physical" | "virtual";
  holder: string;
  purpose: string;
  color: string;
  icon: string;
  card_limit: number | null;
  closing_day: number | null;
  due_day: number | null;
  holder_family_member_id: string | null;
  user_id: string | null;
  created_at: string;
}

/**
 * Tipos para criação/atualização (sem campos readonly)
 */
export type CreateTransactionInput = Omit<ApiTransaction, "id" | "created_at" | "user_id">;
export type UpdateTransactionInput = Partial<Omit<ApiTransaction, "id" | "created_at" | "user_id">>;

export type CreateCategoryInput = Omit<ApiCategory, "id" | "created_at" | "user_id">;
export type UpdateCategoryInput = Partial<Omit<ApiCategory, "id" | "created_at" | "user_id">>;

export type CreateCardInput = Omit<ApiCreditCard, "id" | "created_at" | "user_id">;
export type UpdateCardInput = Partial<Omit<ApiCreditCard, "id" | "created_at" | "user_id">>;

export type CreateFamilyMemberInput = Omit<ApiFamilyMember, "id" | "created_at" | "user_id">;
export type UpdateFamilyMemberInput = Partial<Omit<ApiFamilyMember, "id" | "created_at" | "user_id">>;

/**
 * Tipo para transações extraídas de PDF (antes de salvar no banco)
 */
export interface ExtractedTransaction {
  date: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  categoryId?: string;
  mode?: TransactionMode;
  installment_number?: number;
  installments_total?: number;
}
