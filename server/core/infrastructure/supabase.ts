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
  parent_id: string | null;
  user_id: string | null;
  created_at: string;
}

export type TransactionSource = 'manual' | 'credit_card_import' | 'bank_statement_import';

export interface DbTransaction {
  id: string;
  date: string;
  amount: number;
  type: "income" | "expense";
  category_id: string;
  name: string;
  description: string | null;
  mode: TransactionMode;
  installment_number: number | null;
  installments_total: number | null;
  card_id: string | null;
  user_id: string | null;
  due_date: string | null;
  is_paid: boolean;
  is_recurring: boolean;
  recurring_months: number | null;
  source: TransactionSource;
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

// ============================================
// Family Account Types
// ============================================

export type FamilyRole = 'admin' | 'member';

export interface DbFamilyGroup {
  id: string;
  name: string;
  admin_user_id: string;
  created_at: string;
  updated_at: string;
}

export interface DbFamilyGroupMember {
  id: string;
  family_group_id: string;
  user_id: string;
  role: FamilyRole;
  display_name: string;
  created_at: string;
  created_by_user_id: string;
}

export type DeletionRequestStatus = 'pending' | 'approved' | 'rejected';
export type DeletableResourceType = 'transaction' | 'credit_card';

export interface DbDeletionRequest {
  id: string;
  family_group_id: string;
  resource_type: DeletableResourceType;
  resource_id: string;
  requested_by_user_id: string;
  status: DeletionRequestStatus;
  reason: string | null;
  reviewed_by_user_id: string | null;
  reviewed_at: string | null;
  created_at: string;
}

// Extended Transaction with family fields
export interface DbTransactionWithFamily extends DbTransaction {
  created_by_user_id: string | null;
  family_group_id: string | null;
}

// Extended CreditCard with family fields
export interface DbCreditCardWithFamily extends DbCreditCard {
  created_by_user_id: string | null;
  family_group_id: string | null;
}
