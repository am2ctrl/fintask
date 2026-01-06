/**
 * Tipos de API Responses (formato snake_case do banco de dados)
 */

export interface ApiTransaction {
  id: string;
  user_id: string;
  date: string;
  amount: number;
  type: string;
  category_id: string;
  description: string;
  mode: string;
  installment_number: number | null;
  installments_total: number | null;
  card_id: string | null;
  family_member_id: string | null;
  created_at: string;
}

export interface ApiCategory {
  id: string;
  user_id: string;
  name: string;
  type: string;
  color: string;
  icon: string | null;
  created_at: string;
}

export interface ApiCreditCard {
  id: string;
  user_id: string;
  name: string;
  last_four_digits: string;
  holder_family_member_id: string | null;
  created_at: string;
}

export interface ApiFamilyMember {
  id: string;
  user_id: string;
  name: string;
  relationship: string;
  created_at: string;
}
