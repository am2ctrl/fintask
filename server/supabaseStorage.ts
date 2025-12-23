import { supabase, type DbCategory, type DbTransaction, type DbCreditCard, type TransactionMode } from "./supabase";

export interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
  color: string;
  icon: string | null;
}

export interface Transaction {
  id: string;
  date: Date;
  amount: number;
  type: "income" | "expense";
  categoryId: string;
  description: string;
  mode: TransactionMode;
  installmentNumber: number | null;
  installmentsTotal: number | null;
  cardId: string | null;
}

export interface InsertTransaction {
  date: Date;
  amount: number;
  type: "income" | "expense";
  categoryId: string;
  description: string;
  mode?: TransactionMode;
  installmentNumber?: number | null;
  installmentsTotal?: number | null;
  cardId?: string | null;
}

export interface CreditCard {
  id: string;
  name: string;
  lastFourDigits: string;
  cardType: "physical" | "virtual";
  holder: string;
  purpose: string;
  color: string;
  icon: string;
  limit: number | null;
  closingDay: number | null;
  dueDay: number | null;
}

export interface InsertCreditCard {
  name: string;
  lastFourDigits: string;
  cardType: "physical" | "virtual";
  holder: string;
  purpose: string;
  color: string;
  icon: string;
  limit?: number | null;
  closingDay?: number | null;
  dueDay?: number | null;
}

export interface IStorage {
  getAllCategories(userId?: string): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  createCategory(category: Omit<Category, "id">, userId?: string): Promise<Category>;
  updateCategory(id: string, updates: Partial<Omit<Category, "id">>): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<void>;

  getAllTransactions(userId?: string): Promise<Transaction[]>;
  getTransaction(id: string): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction, userId?: string): Promise<Transaction>;
  updateTransaction(id: string, updates: Partial<InsertTransaction>): Promise<Transaction | undefined>;
  deleteTransaction(id: string): Promise<void>;

  getAllCreditCards(userId?: string): Promise<CreditCard[]>;
  getCreditCard(id: string): Promise<CreditCard | undefined>;
  createCreditCard(card: InsertCreditCard, userId?: string): Promise<CreditCard>;
  updateCreditCard(id: string, updates: Partial<InsertCreditCard>): Promise<CreditCard | undefined>;
  deleteCreditCard(id: string): Promise<void>;
}

function dbCategoryToCategory(dbCat: DbCategory): Category {
  return {
    id: dbCat.id,
    name: dbCat.name,
    type: dbCat.type,
    color: dbCat.color,
    icon: dbCat.icon,
  };
}

function dbTransactionToTransaction(dbTx: DbTransaction): Transaction {
  return {
    id: dbTx.id,
    date: new Date(dbTx.date),
    amount: dbTx.amount,
    type: dbTx.type,
    categoryId: dbTx.category_id,
    description: dbTx.description,
    mode: dbTx.mode,
    installmentNumber: dbTx.installment_number,
    installmentsTotal: dbTx.installments_total,
    cardId: dbTx.card_id,
  };
}

function dbCreditCardToCreditCard(dbCard: DbCreditCard): CreditCard {
  return {
    id: dbCard.id,
    name: dbCard.name,
    lastFourDigits: dbCard.last_four_digits,
    cardType: dbCard.card_type,
    holder: dbCard.holder,
    purpose: dbCard.purpose,
    color: dbCard.color,
    icon: dbCard.icon,
    limit: dbCard.card_limit,
    closingDay: dbCard.closing_day,
    dueDay: dbCard.due_day,
  };
}

export class SupabaseStorage implements IStorage {
  async getAllCategories(userId?: string): Promise<Category[]> {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .or(`user_id.is.null,user_id.eq.${userId || "null"}`)
      .order("name");

    if (error) throw new Error(error.message);
    return (data || []).map(dbCategoryToCategory);
  }

  async getCategory(id: string): Promise<Category | undefined> {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return undefined;
    return data ? dbCategoryToCategory(data) : undefined;
  }

  async createCategory(category: Omit<Category, "id">, userId?: string): Promise<Category> {
    const { data, error } = await supabase
      .from("categories")
      .insert({
        name: category.name,
        type: category.type,
        color: category.color,
        icon: category.icon,
        user_id: userId || null,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return dbCategoryToCategory(data);
  }

  async updateCategory(id: string, updates: Partial<Omit<Category, "id">>): Promise<Category | undefined> {
    const { data, error } = await supabase
      .from("categories")
      .update({
        ...(updates.name && { name: updates.name }),
        ...(updates.type && { type: updates.type }),
        ...(updates.color && { color: updates.color }),
        ...(updates.icon !== undefined && { icon: updates.icon }),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) return undefined;
    return data ? dbCategoryToCategory(data) : undefined;
  }

  async deleteCategory(id: string): Promise<void> {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) throw new Error(error.message);
  }

  async getAllTransactions(userId?: string): Promise<Transaction[]> {
    let query = supabase.from("transactions").select("*").order("date", { ascending: false });
    
    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data || []).map(dbTransactionToTransaction);
  }

  async getTransaction(id: string): Promise<Transaction | undefined> {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return undefined;
    return data ? dbTransactionToTransaction(data) : undefined;
  }

  async createTransaction(transaction: InsertTransaction, userId?: string): Promise<Transaction> {
    const { data, error } = await supabase
      .from("transactions")
      .insert({
        date: transaction.date.toISOString().split("T")[0],
        amount: transaction.amount,
        type: transaction.type,
        category_id: transaction.categoryId,
        description: transaction.description,
        mode: transaction.mode || "avulsa",
        installment_number: transaction.installmentNumber || null,
        installments_total: transaction.installmentsTotal || null,
        card_id: transaction.cardId || null,
        user_id: userId || null,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return dbTransactionToTransaction(data);
  }

  async updateTransaction(id: string, updates: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const updateData: Record<string, unknown> = {};
    if (updates.date) updateData.date = updates.date.toISOString().split("T")[0];
    if (updates.amount !== undefined) updateData.amount = updates.amount;
    if (updates.type) updateData.type = updates.type;
    if (updates.categoryId) updateData.category_id = updates.categoryId;
    if (updates.description) updateData.description = updates.description;
    if (updates.mode) updateData.mode = updates.mode;
    if (updates.installmentNumber !== undefined) updateData.installment_number = updates.installmentNumber;
    if (updates.installmentsTotal !== undefined) updateData.installments_total = updates.installmentsTotal;
    if (updates.cardId !== undefined) updateData.card_id = updates.cardId;

    const { data, error } = await supabase
      .from("transactions")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) return undefined;
    return data ? dbTransactionToTransaction(data) : undefined;
  }

  async deleteTransaction(id: string): Promise<void> {
    const { error } = await supabase.from("transactions").delete().eq("id", id);
    if (error) throw new Error(error.message);
  }

  async getAllCreditCards(userId?: string): Promise<CreditCard[]> {
    let query = supabase.from("credit_cards").select("*").order("name");
    
    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data || []).map(dbCreditCardToCreditCard);
  }

  async getCreditCard(id: string): Promise<CreditCard | undefined> {
    const { data, error } = await supabase
      .from("credit_cards")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return undefined;
    return data ? dbCreditCardToCreditCard(data) : undefined;
  }

  async createCreditCard(card: InsertCreditCard, userId?: string): Promise<CreditCard> {
    const { data, error } = await supabase
      .from("credit_cards")
      .insert({
        name: card.name,
        last_four_digits: card.lastFourDigits,
        card_type: card.cardType,
        holder: card.holder,
        purpose: card.purpose,
        color: card.color,
        icon: card.icon,
        card_limit: card.limit || null,
        closing_day: card.closingDay || null,
        due_day: card.dueDay || null,
        user_id: userId || null,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return dbCreditCardToCreditCard(data);
  }

  async updateCreditCard(id: string, updates: Partial<InsertCreditCard>): Promise<CreditCard | undefined> {
    const updateData: Record<string, unknown> = {};
    if (updates.name) updateData.name = updates.name;
    if (updates.lastFourDigits) updateData.last_four_digits = updates.lastFourDigits;
    if (updates.cardType) updateData.card_type = updates.cardType;
    if (updates.holder) updateData.holder = updates.holder;
    if (updates.purpose) updateData.purpose = updates.purpose;
    if (updates.color) updateData.color = updates.color;
    if (updates.icon) updateData.icon = updates.icon;
    if (updates.limit !== undefined) updateData.card_limit = updates.limit;
    if (updates.closingDay !== undefined) updateData.closing_day = updates.closingDay;
    if (updates.dueDay !== undefined) updateData.due_day = updates.dueDay;

    const { data, error } = await supabase
      .from("credit_cards")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) return undefined;
    return data ? dbCreditCardToCreditCard(data) : undefined;
  }

  async deleteCreditCard(id: string): Promise<void> {
    const { error } = await supabase.from("credit_cards").delete().eq("id", id);
    if (error) throw new Error(error.message);
  }
}

export const storage = new SupabaseStorage();
