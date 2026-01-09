/**
 * Mapeamento de IDs e nomes para UUIDs do Supabase
 *
 * Sistema Hierárquico: Categorias Pai -> Subcategorias
 *
 * IMPORTANTE: Execute o script SQL em `server/utils/seedDefaultCategories.sql`
 * no Supabase para criar as categorias com esses UUIDs específicos.
 */

// ========================================================
// CATEGORIAS PAI (parent_id IS NULL)
// ========================================================

export const PARENT_CATEGORIES = {
  // Receitas
  RECEITAS: '10000000-0000-0000-0000-000000000001',

  // Despesas
  MORADIA: '20000000-0000-0000-0000-000000000001',
  TRANSPORTE: '20000000-0000-0000-0000-000000000002',
  ALIMENTACAO: '20000000-0000-0000-0000-000000000003',
  SAUDE: '20000000-0000-0000-0000-000000000004',
  EDUCACAO: '20000000-0000-0000-0000-000000000005',
  LAZER: '20000000-0000-0000-0000-000000000006',
  STREAMING: '20000000-0000-0000-0000-000000000007',
  TRIBUTOS: '20000000-0000-0000-0000-000000000008',
  COMPRAS: '20000000-0000-0000-0000-000000000009',
  OUTROS: '20000000-0000-0000-0000-000000000010',
} as const;

// ========================================================
// SUBCATEGORIAS POR GRUPO
// ========================================================

export const SUBCATEGORIES = {
  // Receitas
  SALARIO: '10000000-0000-0000-0000-000000000101',
  FREELANCE: '10000000-0000-0000-0000-000000000102',
  INVESTIMENTOS: '10000000-0000-0000-0000-000000000103',
  BONIFICACOES: '10000000-0000-0000-0000-000000000104',
  REEMBOLSOS: '10000000-0000-0000-0000-000000000105',
  OUTRAS_RECEITAS: '10000000-0000-0000-0000-000000000106',

  // Moradia
  HABITACAO: '20000000-0000-0000-0000-000000000101',
  CONTAS_CONSUMO: '20000000-0000-0000-0000-000000000102',
  MANUTENCAO_CASA: '20000000-0000-0000-0000-000000000103',
  SMART_HOME: '20000000-0000-0000-0000-000000000104',
  CASA_UTENSILIOS: '20000000-0000-0000-0000-000000000105',

  // Transporte
  COMBUSTIVEL: '20000000-0000-0000-0000-000000000201',
  MANUTENCAO_VEICULO: '20000000-0000-0000-0000-000000000202',
  DOCUMENTACAO: '20000000-0000-0000-0000-000000000203',
  URBANO: '20000000-0000-0000-0000-000000000204',
  ACESSORIOS_VEICULO: '20000000-0000-0000-0000-000000000205',

  // Alimentação
  SUPERMERCADO: '20000000-0000-0000-0000-000000000301',
  ALIMENTACAO_FORA: '20000000-0000-0000-0000-000000000302',
  PADARIA_FEIRA: '20000000-0000-0000-0000-000000000303',
  SUPLEMENTACAO: '20000000-0000-0000-0000-000000000304',

  // Saúde
  PLANO_SAUDE: '20000000-0000-0000-0000-000000000401',
  FARMACIA: '20000000-0000-0000-0000-000000000402',
  CONSULTAS_EXAMES: '20000000-0000-0000-0000-000000000403',
  PROCEDIMENTOS: '20000000-0000-0000-0000-000000000404',
  CUIDADOS_BEM_ESTAR: '20000000-0000-0000-0000-000000000405',

  // Educação
  MENSALIDADE_ESCOLAR: '20000000-0000-0000-0000-000000000501',
  CURSOS: '20000000-0000-0000-0000-000000000502',
  LIVROS_MATERIAL: '20000000-0000-0000-0000-000000000503',

  // Lazer
  VIAGENS_FERIAS: '20000000-0000-0000-0000-000000000601',
  ENTRETENIMENTO: '20000000-0000-0000-0000-000000000602',
  HOBBIES_CULTURA: '20000000-0000-0000-0000-000000000603',
  VIDA_NOTURNA: '20000000-0000-0000-0000-000000000604',

  // Streaming/Serviços
  STREAMING_TV: '20000000-0000-0000-0000-000000000701',
  MUSICA: '20000000-0000-0000-0000-000000000702',
  CLOUD_STORAGE: '20000000-0000-0000-0000-000000000703',
  INTELIGENCIA_ARTIFICIAL: '20000000-0000-0000-0000-000000000704',
  GAMES: '20000000-0000-0000-0000-000000000705',

  // Tributos
  IPVA: '20000000-0000-0000-0000-000000000801',
  IPTU: '20000000-0000-0000-0000-000000000802',
  IRPF: '20000000-0000-0000-0000-000000000803',
  GANHO_CAPITAL: '20000000-0000-0000-0000-000000000804',
  TAXAS_PROFISSIONAIS: '20000000-0000-0000-0000-000000000805',
  MULTAS: '20000000-0000-0000-0000-000000000806',
  SEGURO_INCENDIO: '20000000-0000-0000-0000-000000000807',
  OUTROS_TRIBUTOS: '20000000-0000-0000-0000-000000000808',

  // Compras
  VESTUARIO: '20000000-0000-0000-0000-000000000901',
  PRESENTES: '20000000-0000-0000-0000-000000000902',
  ELETRONICOS: '20000000-0000-0000-0000-000000000903',
  CUIDADOS_PESSOAIS: '20000000-0000-0000-0000-000000000904',

  // Outros
  TAXAS_BANCARIAS: '20000000-0000-0000-0000-000000001001',
  TRANSFERENCIAS: '20000000-0000-0000-0000-000000001002',
  NAO_IDENTIFICADO: '20000000-0000-0000-0000-000000001003',
} as const;

// ========================================================
// MAPEAMENTO NOME -> UUID (para AI categorizer)
// ========================================================

export const CATEGORY_NAME_TO_UUID: Record<string, string> = {
  // Receitas (subcategorias)
  'Salário': SUBCATEGORIES.SALARIO,
  'Freelance': SUBCATEGORIES.FREELANCE,
  'Investimentos': SUBCATEGORIES.INVESTIMENTOS,
  'Bonificações': SUBCATEGORIES.BONIFICACOES,
  'Reembolsos': SUBCATEGORIES.REEMBOLSOS,
  'Outras Receitas': SUBCATEGORIES.OUTRAS_RECEITAS,

  // Moradia (subcategorias)
  'Habitação': SUBCATEGORIES.HABITACAO,
  'Contas de Consumo': SUBCATEGORIES.CONTAS_CONSUMO,
  'Manutenção': SUBCATEGORIES.MANUTENCAO_CASA,
  'Smart Home': SUBCATEGORIES.SMART_HOME,
  'Casa e Utensílios': SUBCATEGORIES.CASA_UTENSILIOS,

  // Transporte (subcategorias)
  'Combustível': SUBCATEGORIES.COMBUSTIVEL,
  'Manutenção Veicular': SUBCATEGORIES.MANUTENCAO_VEICULO,
  'Documentação': SUBCATEGORIES.DOCUMENTACAO,
  'Urbano': SUBCATEGORIES.URBANO,
  'Acessórios Veículo': SUBCATEGORIES.ACESSORIOS_VEICULO,

  // Alimentação (subcategorias)
  'Supermercado': SUBCATEGORIES.SUPERMERCADO,
  'Alimentação Fora': SUBCATEGORIES.ALIMENTACAO_FORA,
  'Padaria e Feira': SUBCATEGORIES.PADARIA_FEIRA,
  'Suplementação': SUBCATEGORIES.SUPLEMENTACAO,

  // Saúde (subcategorias)
  'Plano de Saúde': SUBCATEGORIES.PLANO_SAUDE,
  'Farmácia': SUBCATEGORIES.FARMACIA,
  'Consultas e Exames': SUBCATEGORIES.CONSULTAS_EXAMES,
  'Procedimentos': SUBCATEGORIES.PROCEDIMENTOS,
  'Cuidados e Bem-estar': SUBCATEGORIES.CUIDADOS_BEM_ESTAR,

  // Educação (subcategorias)
  'Mensalidade Escolar': SUBCATEGORIES.MENSALIDADE_ESCOLAR,
  'Cursos': SUBCATEGORIES.CURSOS,
  'Livros e Material': SUBCATEGORIES.LIVROS_MATERIAL,

  // Lazer (subcategorias)
  'Viagens e Férias': SUBCATEGORIES.VIAGENS_FERIAS,
  'Entretenimento': SUBCATEGORIES.ENTRETENIMENTO,
  'Hobbies e Cultura': SUBCATEGORIES.HOBBIES_CULTURA,
  'Vida Noturna': SUBCATEGORIES.VIDA_NOTURNA,

  // Streaming (subcategorias)
  'Streaming TV': SUBCATEGORIES.STREAMING_TV,
  'Música': SUBCATEGORIES.MUSICA,
  'Cloud e Storage': SUBCATEGORIES.CLOUD_STORAGE,
  'Inteligência Artificial': SUBCATEGORIES.INTELIGENCIA_ARTIFICIAL,
  'Games': SUBCATEGORIES.GAMES,

  // Tributos (subcategorias)
  'IPVA': SUBCATEGORIES.IPVA,
  'IPTU': SUBCATEGORIES.IPTU,
  'IRPF': SUBCATEGORIES.IRPF,
  'Ganho de Capital': SUBCATEGORIES.GANHO_CAPITAL,
  'Taxas Profissionais': SUBCATEGORIES.TAXAS_PROFISSIONAIS,
  'Multas': SUBCATEGORIES.MULTAS,
  'Seguro Incêndio': SUBCATEGORIES.SEGURO_INCENDIO,
  'Outros Tributos': SUBCATEGORIES.OUTROS_TRIBUTOS,

  // Compras (subcategorias)
  'Vestuário': SUBCATEGORIES.VESTUARIO,
  'Presentes': SUBCATEGORIES.PRESENTES,
  'Eletrônicos': SUBCATEGORIES.ELETRONICOS,
  'Cuidados Pessoais': SUBCATEGORIES.CUIDADOS_PESSOAIS,

  // Outros (subcategorias)
  'Taxas Bancárias': SUBCATEGORIES.TAXAS_BANCARIAS,
  'Transferências': SUBCATEGORIES.TRANSFERENCIAS,
  'Não Identificado': SUBCATEGORIES.NAO_IDENTIFICADO,
};

// ========================================================
// MAPEAMENTO LEGADO (IDs numéricos -> novos UUIDs)
// Para compatibilidade com dados antigos
// ========================================================

export const LEGACY_CATEGORY_ID_MAP: Record<string, string> = {
  // IDs antigos (1-12) mapeados para subcategorias mais próximas
  "1": SUBCATEGORIES.SALARIO,              // Salário (era Salário)
  "2": SUBCATEGORIES.FREELANCE,            // Freelance (era Freelance)
  "3": SUBCATEGORIES.INVESTIMENTOS,        // Investimentos (era Investimentos)
  "4": SUBCATEGORIES.OUTRAS_RECEITAS,      // Outros receita (era Outros)
  "5": SUBCATEGORIES.SUPERMERCADO,         // Alimentação (era Alimentação)
  "6": SUBCATEGORIES.COMBUSTIVEL,          // Transporte (era Transporte)
  "7": SUBCATEGORIES.HABITACAO,            // Moradia (era Moradia)
  "8": SUBCATEGORIES.FARMACIA,             // Saúde (era Saúde)
  "9": SUBCATEGORIES.CURSOS,               // Educação (era Educação)
  "10": SUBCATEGORIES.ENTRETENIMENTO,      // Lazer (era Lazer)
  "11": SUBCATEGORIES.CONTAS_CONSUMO,      // Contas (era Contas)
  "12": SUBCATEGORIES.VESTUARIO,           // Compras (era Compras)
};

/**
 * Mapeia um ID de categoria (numérico legado ou UUID) para UUID válido
 *
 * @param id - ID de categoria ("1"-"12" legado ou UUID)
 * @returns UUID válido do Supabase
 * @throws Error se ID inválido
 */
export function mapCategoryId(id: string): string {
  // Se já é UUID válido, retorna direto
  if (isValidUUID(id)) {
    return id;
  }

  // Se é ID numérico legado, mapeia para nova subcategoria
  if (LEGACY_CATEGORY_ID_MAP[id]) {
    return LEGACY_CATEGORY_ID_MAP[id];
  }

  // ID inválido
  throw new Error(
    `ID de categoria inválido: "${id}". ` +
    `Esperado: UUID válido ou ID numérico legado de 1-12.`
  );
}

/**
 * Valida se string é UUID no formato RFC4122
 */
export function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * Retorna nome da categoria dado um UUID
 */
export function getCategoryName(uuid: string): string {
  for (const [name, id] of Object.entries(CATEGORY_NAME_TO_UUID)) {
    if (id === uuid) return name;
  }
  return "Não Identificado";
}

/**
 * Retorna UUID da categoria "Não Identificado" como fallback
 */
export function getFallbackCategoryId(): string {
  return SUBCATEGORIES.NAO_IDENTIFICADO;
}

/**
 * Retorna UUID da categoria "Outras Receitas" como fallback para income
 */
export function getFallbackIncomeCategoryId(): string {
  return SUBCATEGORIES.OUTRAS_RECEITAS;
}
