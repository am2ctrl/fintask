import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing Supabase environment variables (SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required)");
}

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function verifySupabaseToken(token: string): Promise<string | null> {
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      return null;
    }
    return data.user.id;
  } catch {
    return null;
  }
}

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
