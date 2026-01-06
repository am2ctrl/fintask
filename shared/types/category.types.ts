/**
 * Tipos relacionados a Categorias
 */

export type CategoryType = "income" | "expense";

export interface Category {
  id: string;
  userId: string;
  name: string;
  type: CategoryType;
  color: string;
  icon: string | null;
  createdAt: string;
}

export interface CreateCategoryInput {
  name: string;
  type: CategoryType;
  color: string;
  icon?: string | null;
}

export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {}
