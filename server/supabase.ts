import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

export interface DbUser {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  created_at: string;
}
