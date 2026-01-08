/**
 * Mapeamento de IDs numéricos do frontend (legado) para UUIDs do Supabase
 *
 * Este arquivo resolve a incompatibilidade entre:
 * - Frontend: CategoryBadge.tsx usa IDs "1"-"12" (strings numéricas)
 * - Backend: Supabase espera UUIDs no formato RFC4122
 *
 * IMPORTANTE: Execute o script SQL em `server/utils/seedDefaultCategories.sql`
 * no Supabase para criar as categorias com esses UUIDs específicos.
 */

// UUIDs fixos para categorias padrão (devem existir no banco com user_id IS NULL)
export const CATEGORY_ID_MAP: Record<string, string> = {
  // Receitas (income)
  "1": "11111111-1111-1111-1111-111111111111", // Salário
  "2": "22222222-2222-2222-2222-222222222222", // Freelance
  "3": "33333333-3333-3333-3333-333333333333", // Investimentos
  "4": "44444444-4111-1111-1111-111111111111", // Outros (receita)

  // Despesas (expense)
  "5": "55555555-5555-5555-5555-555555555555", // Alimentação
  "6": "66666666-6666-6666-6666-666666666666", // Transporte
  "7": "77777777-7777-7777-7777-777777777777", // Moradia
  "8": "88888888-8888-8888-8888-888888888888", // Saúde
  "9": "99999999-9999-9999-9999-999999999999", // Educação ← Este era o "9" que causava erro!
  "10": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", // Lazer
  "11": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb", // Contas
  "12": "cccccccc-cccc-cccc-cccc-cccccccccccc", // Compras
};

/**
 * Mapeia um ID de categoria (numérico ou UUID) para UUID válido
 *
 * @param id - ID de categoria ("1"-"12" ou UUID)
 * @returns UUID válido do Supabase
 * @throws Error se ID inválido
 */
export function mapCategoryId(id: string): string {
  // Se já é UUID válido (formato xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx), retorna direto
  if (isValidUUID(id)) {
    return id;
  }

  // Se é ID numérico, mapeia para UUID
  if (CATEGORY_ID_MAP[id]) {
    return CATEGORY_ID_MAP[id];
  }

  // ID inválido - não é UUID nem ID numérico conhecido
  throw new Error(
    `ID de categoria inválido: "${id}". ` +
    `Esperado: UUID válido ou ID numérico de 1-12.`
  );
}

/**
 * Valida se string é UUID no formato RFC4122
 *
 * @param id - String a validar
 * @returns true se é UUID válido
 */
function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * Retorna nome da categoria dado um ID (para logs/debug)
 *
 * @param id - ID numérico ou UUID
 * @returns Nome da categoria ou "Desconhecida"
 */
export function getCategoryName(id: string): string {
  const names: Record<string, string> = {
    "1": "Salário",
    "2": "Freelance",
    "3": "Investimentos",
    "4": "Outros (receita)",
    "5": "Alimentação",
    "6": "Transporte",
    "7": "Moradia",
    "8": "Saúde",
    "9": "Educação",
    "10": "Lazer",
    "11": "Contas",
    "12": "Compras",
  };

  return names[id] || "Desconhecida";
}
