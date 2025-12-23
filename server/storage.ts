import { randomUUID } from "crypto";

export interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
  color: string;
}

export interface Transaction {
  id: string;
  date: Date;
  amount: number;
  type: "income" | "expense";
  categoryId: string;
  description: string;
}

export interface InsertTransaction {
  date: Date;
  amount: number;
  type: "income" | "expense";
  categoryId: string;
  description: string;
}

export interface IStorage {
  getAllCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  createCategory(category: Omit<Category, "id">): Promise<Category>;
  
  getAllTransactions(): Promise<Transaction[]>;
  getTransaction(id: string): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: string, updates: Partial<InsertTransaction>): Promise<Transaction | undefined>;
  deleteTransaction(id: string): Promise<void>;
}

const defaultCategories: Category[] = [
  { id: "1", name: "Salário", type: "income", color: "#22c55e" },
  { id: "2", name: "Freelance", type: "income", color: "#10b981" },
  { id: "3", name: "Investimentos", type: "income", color: "#14b8a6" },
  { id: "4", name: "Outros", type: "income", color: "#06b6d4" },
  { id: "5", name: "Alimentação", type: "expense", color: "#f97316" },
  { id: "6", name: "Transporte", type: "expense", color: "#eab308" },
  { id: "7", name: "Moradia", type: "expense", color: "#ef4444" },
  { id: "8", name: "Saúde", type: "expense", color: "#ec4899" },
  { id: "9", name: "Educação", type: "expense", color: "#8b5cf6" },
  { id: "10", name: "Lazer", type: "expense", color: "#6366f1" },
  { id: "11", name: "Contas", type: "expense", color: "#0ea5e9" },
  { id: "12", name: "Compras", type: "expense", color: "#84cc16" },
];

export class MemStorage implements IStorage {
  private categories: Map<string, Category>;
  private transactions: Map<string, Transaction>;

  constructor() {
    this.categories = new Map();
    this.transactions = new Map();

    defaultCategories.forEach((cat) => {
      this.categories.set(cat.id, cat);
    });
  }

  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: string): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(category: Omit<Category, "id">): Promise<Category> {
    const id = randomUUID();
    const newCategory: Category = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }

  async getAllTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).sort(
      (a, b) => b.date.getTime() - a.date.getTime()
    );
  }

  async getTransaction(id: string): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const id = randomUUID();
    const newTransaction: Transaction = { ...transaction, id };
    this.transactions.set(id, newTransaction);
    return newTransaction;
  }

  async updateTransaction(
    id: string,
    updates: Partial<InsertTransaction>
  ): Promise<Transaction | undefined> {
    const existing = this.transactions.get(id);
    if (!existing) return undefined;

    const updated: Transaction = {
      ...existing,
      ...updates,
      id,
    };
    this.transactions.set(id, updated);
    return updated;
  }

  async deleteTransaction(id: string): Promise<void> {
    this.transactions.delete(id);
  }
}

export const storage = new MemStorage();
