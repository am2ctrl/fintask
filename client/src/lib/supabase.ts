import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase environment variables not configured");
}

export const supabase = createClient(
  supabaseUrl || "",
  supabaseAnonKey || ""
);

export type TransactionMode = "avulsa" | "recorrente" | "parcelada";

export interface DbCategory {
  id: string;
  name: string;
  type: "income" | "expense";
  color: string;
  icon: string | null;
  user_id: string | null;
  created_at: string;
}

export interface DbTransaction {
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
  user_id: string | null;
  created_at: string;
}

export interface DbCreditCard {
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
  user_id: string | null;
  created_at: string;
}
