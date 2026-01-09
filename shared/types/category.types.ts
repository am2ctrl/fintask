/**
 * Tipos relacionados a Categorias
 *
 * Sistema hierárquico: Categorias Pai -> Subcategorias
 * Exemplo: Moradia (pai) -> Habitação, Contas de Consumo, Manutenção (filhas)
 */

export type CategoryType = "income" | "expense";

export interface Category {
  id: string;
  userId: string;
  name: string;
  type: CategoryType;
  color: string;
  icon: string | null;
  parentId: string | null; // null = categoria pai, UUID = subcategoria
  createdAt: string;
}

export interface CreateCategoryInput {
  name: string;
  type: CategoryType;
  color: string;
  icon?: string | null;
  parentId?: string | null;
}

export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {}

/**
 * Categoria pai com suas subcategorias agrupadas
 * Útil para exibição em árvore/hierarquia
 */
export interface CategoryWithChildren extends Category {
  children: Category[];
}

/**
 * Helper type para categorias flat com informação de profundidade
 */
export interface FlatCategoryWithDepth extends Category {
  depth: number; // 0 = pai, 1 = filho
  parentName?: string;
}
