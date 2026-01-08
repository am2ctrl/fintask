import { supabase, type DbCategory, type DbTransaction, type DbCreditCard, type TransactionMode } from "./supabase";

export interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
  color: string;
  icon: string | null;
}

export interface FamilyMember {
  id: string;
  userId: string;
  name: string;
  relationship: "self" | "spouse" | "child" | "other";
  isPrimary: boolean;
  createdAt: Date;
}

export interface InsertFamilyMember {
  name: string;
  relationship: "self" | "spouse" | "child" | "other";
  isPrimary?: boolean;
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
  familyMemberId: string | null;
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
  familyMemberId?: string | null;
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
  holderFamilyMemberId: string | null;
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
  holderFamilyMemberId?: string | null;
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

  getAllFamilyMembers(userId: string): Promise<FamilyMember[]>;
  getFamilyMember(id: string): Promise<FamilyMember | undefined>;
  findFamilyMemberByName(userId: string, name: string): Promise<FamilyMember | null>;
  createFamilyMember(data: InsertFamilyMember, userId: string): Promise<FamilyMember>;
  updateFamilyMember(id: string, updates: Partial<InsertFamilyMember>): Promise<FamilyMember | undefined>;
  deleteFamilyMember(id: string): Promise<void>;
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
    familyMemberId: (dbTx as any).family_member_id || null,
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
    holderFamilyMemberId: (dbCard as any).holder_family_member_id || null,
  };
}

export class SupabaseStorage implements IStorage {
  async getAllCategories(userId?: string): Promise<Category[]> {
    // ⚡ OTIMIZAÇÃO: Duas queries paralelas ao invés de OR (mais rápido com índices)
    const [defaultCats, userCats] = await Promise.all([
      supabase.from("categories").select("*").is("user_id", null),
      userId ? supabase.from("categories").select("*").eq("user_id", userId) : Promise.resolve({ data: null, error: null })
    ]);

    if (defaultCats.error) throw new Error(defaultCats.error.message);
    if (userCats.error) throw new Error(userCats.error.message);

    // Merge results
    const allData = [...(defaultCats.data || []), ...(userCats.data || [])];

    // Sort by name (since we lost .order() in split queries)
    return allData
      .map(dbCategoryToCategory)
      .sort((a, b) => a.name.localeCompare(b.name));
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
    console.log("[supabaseStorage] Executando createCategory");
    console.log("[supabaseStorage] Dados:", { ...category, user_id: userId });

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

    if (error) {
      console.error("[supabaseStorage] ERRO ao inserir categoria:", JSON.stringify(error, null, 2));
      throw new Error(error.message);
    }

    console.log("[supabaseStorage] Categoria inserida com sucesso:", data);
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
        family_member_id: transaction.familyMemberId || null,
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
    if (updates.familyMemberId !== undefined) updateData.family_member_id = updates.familyMemberId;

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

  async batchCreateTransactions(
    transactions: InsertTransaction[],
    userId: string
  ): Promise<Transaction[]> {
    // 🔍 LOG: Mapear dados antes de inserir
    const dataToInsert = transactions.map((tx, index) => {
      const mapped = {
        date: tx.date.toISOString().split("T")[0],
        amount: tx.amount,
        type: tx.type,
        category_id: tx.categoryId,
        description: tx.description,
        mode: tx.mode || "avulsa",
        installment_number: tx.installmentNumber || null,
        installments_total: tx.installmentsTotal || null,
        card_id: tx.cardId || null,
        family_member_id: tx.familyMemberId || null,
        user_id: userId,
      };

      // Log da primeira transação para debug
      if (index === 0) {
        console.log("🔍 [batchCreateTransactions] Primeira transação mapeada:", JSON.stringify(mapped, null, 2));
      }

      return mapped;
    });

    const { data, error } = await supabase
      .from("transactions")
      .insert(dataToInsert)
      .select();

    if (error) {
      console.error("❌ [batchCreateTransactions] Erro do Supabase:", JSON.stringify(error, null, 2));
      console.error("❌ [batchCreateTransactions] Dados que tentou inserir:", JSON.stringify(dataToInsert.slice(0, 3), null, 2));
      throw new Error(error.message);
    }

    return (data || []).map(dbTransactionToTransaction);
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
        holder_family_member_id: card.holderFamilyMemberId || null,
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
    if (updates.holderFamilyMemberId !== undefined) updateData.holder_family_member_id = updates.holderFamilyMemberId;

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

  // Family Members methods
  async getAllFamilyMembers(userId: string): Promise<FamilyMember[]> {
    const { data, error } = await supabase
      .from("family_members")
      .select("*")
      .eq("user_id", userId)
      .order("is_primary", { ascending: false })
      .order("name");

    if (error) throw new Error(error.message);
    return (data || []).map(this.dbFamilyMemberToFamilyMember);
  }

  async getFamilyMember(id: string): Promise<FamilyMember | undefined> {
    const { data, error } = await supabase
      .from("family_members")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return undefined;
    return data ? this.dbFamilyMemberToFamilyMember(data) : undefined;
  }

  async findFamilyMemberByName(userId: string, name: string): Promise<FamilyMember | null> {
    const { data, error } = await supabase
      .from("family_members")
      .select("*")
      .eq("user_id", userId)
      .ilike("name", `%${name}%`)
      .maybeSingle();

    if (error && error.code !== "PGRST116") throw new Error(error.message);
    return data ? this.dbFamilyMemberToFamilyMember(data) : null;
  }

  async createFamilyMember(data: InsertFamilyMember, userId: string): Promise<FamilyMember> {
    const { data: member, error } = await supabase
      .from("family_members")
      .insert({
        user_id: userId,
        name: data.name,
        relationship: data.relationship,
        is_primary: data.isPrimary || false,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this.dbFamilyMemberToFamilyMember(member);
  }

  async updateFamilyMember(id: string, updates: Partial<InsertFamilyMember>): Promise<FamilyMember | undefined> {
    const updateData: Record<string, unknown> = {};
    if (updates.name) updateData.name = updates.name;
    if (updates.relationship) updateData.relationship = updates.relationship;
    if (updates.isPrimary !== undefined) updateData.is_primary = updates.isPrimary;

    const { data, error } = await supabase
      .from("family_members")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) return undefined;
    return data ? this.dbFamilyMemberToFamilyMember(data) : undefined;
  }

  async deleteFamilyMember(id: string): Promise<void> {
    const { error } = await supabase.from("family_members").delete().eq("id", id);
    if (error) throw new Error(error.message);
  }

  private dbFamilyMemberToFamilyMember(db: any): FamilyMember {
    return {
      id: db.id,
      userId: db.user_id,
      name: db.name,
      relationship: db.relationship,
      isPrimary: db.is_primary,
      createdAt: new Date(db.created_at),
    };
  }
}

export const storage = new SupabaseStorage();
