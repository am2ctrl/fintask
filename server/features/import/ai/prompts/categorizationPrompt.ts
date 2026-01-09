import type { ParsedTransaction } from '../../parsers/statementParser';

// Tipo simples de Category para uso em AI
interface CategoryForAI {
  id: string;
  name: string;
  type: "income" | "expense";
  parentId?: string | null;
  parentName?: string;
}

/**
 * Exemplos de palavras-chave para cada subcategoria
 * Usado para ajudar a IA a identificar a categoria correta
 */
const categoryKeywords: Record<string, string[]> = {
  // ========================================================
  // RECEITAS
  // ========================================================
  'Salário': ['salario', 'folha', 'pagamento', 'holerite', 'vencimento', 'remuneracao', 'proventos', '13o', 'ferias', 'adiantamento salarial'],
  'Freelance': ['freelance', 'freela', 'autonomo', 'prestacao servico', 'pj', 'nota fiscal', 'nfs', 'projeto'],
  'Investimentos': ['dividendo', 'jcp', 'rendimento', 'juros', 'proventos', 'fii', 'acao', 'cdb', 'lci', 'lca', 'tesouro'],
  'Bonificações': ['bonus', 'plr', 'participacao lucros', 'premio', 'gratificacao', 'comissao'],
  'Reembolsos': ['reembolso', 'estorno', 'devolucao', 'ressarcimento', 'credito'],
  'Outras Receitas': ['venda', 'presente', 'transferencia recebida', 'pix recebido', 'deposito'],

  // ========================================================
  // MORADIA
  // ========================================================
  'Habitação': ['aluguel', 'condominio', 'prestacao imovel', 'financiamento', 'iptu', 'foro', 'laudemio'],
  'Contas de Consumo': ['luz', 'energia', 'enel', 'cemig', 'copel', 'eletropaulo', 'agua', 'sanepar', 'sabesp', 'gas', 'comgas', 'internet', 'net', 'claro', 'vivo', 'tim', 'oi', 'telefone'],
  'Manutenção': ['reparo', 'conserto', 'manutencao', 'diarista', 'faxina', 'limpeza', 'jardineiro', 'piscina', 'reforma', 'pedreiro', 'eletricista', 'encanador'],
  'Smart Home': ['alexa', 'google home', 'robo aspirador', 'roomba', 'camera', 'intelbras', 'automacao', 'smart'],
  'Casa e Utensílios': ['decoracao', 'moveis', 'sofa', 'cama', 'mesa', 'cadeira', 'tapete', 'cortina', 'eletrodomestico', 'geladeira', 'fogao', 'microondas', 'liquidificador', 'panela', 'tok stok', 'etna', 'leroy merlin', 'telha norte'],

  // ========================================================
  // TRANSPORTE
  // ========================================================
  'Combustível': ['posto', 'gasolina', 'alcool', 'etanol', 'diesel', 'gnv', 'shell', 'petrobras', 'ipiranga', 'ale'],
  'Manutenção Veicular': ['oficina', 'mecanico', 'oleo', 'pneu', 'freio', 'suspensao', 'alinhamento', 'balanceamento', 'revisao', 'pecas'],
  'Documentação': ['licenciamento', 'dpvat', 'seguro auto', 'seguro carro', 'detran', 'transferencia veiculo', 'ipva'],
  'Urbano': ['uber', '99', 'cabify', 'taxi', 'onibus', 'metro', 'trem', 'bilhete unico', 'bom', 'estacionamento', 'zona azul', 'estapar', 'pedagio', 'sem parar', 'conectcar', 'veloe'],
  'Acessórios Veículo': ['tapete carro', 'acessorio', 'capa banco', 'som automotivo', 'multimidia', 'gps'],

  // ========================================================
  // ALIMENTAÇÃO
  // ========================================================
  'Supermercado': ['supermercado', 'mercado', 'extra', 'pao de acucar', 'carrefour', 'atacadao', 'assai', 'sams club', 'costco', 'big', 'nacional', 'zaffari', 'compras mes', 'rancho', 'higiene', 'limpeza'],
  'Alimentação Fora': ['restaurante', 'ifood', 'rappi', 'uber eats', 'delivery', 'lanchonete', 'fast food', 'mcdonalds', 'burger king', 'outback', 'madero', 'coco bambu', 'bar', 'boteco', 'cafeteria', 'starbucks'],
  'Padaria e Feira': ['padaria', 'panificadora', 'feira', 'hortifruti', 'sacolao', 'quitanda', 'acougue', 'peixaria'],
  'Suplementação': ['whey', 'creatina', 'vitamina', 'suplemento', 'growth', 'max titanium', 'integralmedica', 'optimum', 'hipercalorico', 'bcaa'],

  // ========================================================
  // SAÚDE
  // ========================================================
  'Plano de Saúde': ['unimed', 'sulamerica', 'bradesco saude', 'amil', 'hapvida', 'notre dame', 'plano de saude', 'convenio', 'mensalidade plano'],
  'Farmácia': ['farmacia', 'drogaria', 'droga raia', 'drogasil', 'pacheco', 'panvel', 'pague menos', 'remedio', 'medicamento', 'vitamina', 'cosmetico farmacia'],
  'Consultas e Exames': ['consulta', 'medico', 'exame', 'laboratorio', 'fleury', 'dasa', 'lavoisier', 'hermes pardini', 'radiologia', 'ultrassom', 'ressonancia', 'tomografia'],
  'Procedimentos': ['cirurgia', 'procedimento', 'internacao', 'hospital', 'clinica', 'anestesia', 'botox', 'preenchimento', 'lipo', 'plastica'],
  'Cuidados e Bem-estar': ['academia', 'smart fit', 'bluefit', 'bodytech', 'personal', 'pilates', 'yoga', 'nutricionista', 'nutri', 'dermatologista', 'derma', 'fisioterapia', 'fisio', 'massagem', 'spa', 'salao', 'cabelereiro', 'barbearia', 'manicure', 'estetica'],

  // ========================================================
  // EDUCAÇÃO
  // ========================================================
  'Mensalidade Escolar': ['escola', 'colegio', 'faculdade', 'universidade', 'mensalidade escolar', 'matricula', 'uniforme', 'material escolar'],
  'Cursos': ['curso', 'udemy', 'alura', 'rocketseat', 'origamid', 'workshop', 'bootcamp', 'mba', 'pos graduacao', 'especializacao', 'ingles', 'wizard', 'fisk', 'ccaa', 'cultura inglesa'],
  'Livros e Material': ['livro', 'livraria', 'saraiva', 'cultura', 'amazon livro', 'kindle', 'ebook', 'apostila'],

  // ========================================================
  // LAZER
  // ========================================================
  'Viagens e Férias': ['hotel', 'pousada', 'airbnb', 'booking', 'decolar', 'latam', 'gol', 'azul', 'passagem aerea', 'hospedagem', 'resort', 'cruzeiro', 'pacote viagem', 'turismo'],
  'Entretenimento': ['cinema', 'cinemark', 'cinepolis', 'uci', 'teatro', 'show', 'ingresso', 'sympla', 'eventim', 'parque', 'museu', 'evento', 'futebol', 'jogo', 'arena'],
  'Hobbies e Cultura': ['livro', 'jogo', 'game', 'instrumento', 'violao', 'guitarra', 'piano', 'teclado', 'hobby', 'arte', 'pintura', 'fotografia'],
  'Vida Noturna': ['bar', 'pub', 'balada', 'festa', 'boate', 'club', 'drinks', 'cerveja', 'chopp', 'vinho'],

  // ========================================================
  // STREAMING E SERVIÇOS
  // ========================================================
  'Streaming TV': ['netflix', 'amazon prime', 'prime video', 'disney', 'hbo', 'max', 'apple tv', 'paramount', 'globoplay', 'star+', 'telecine', 'streaming'],
  'Música': ['spotify', 'apple music', 'deezer', 'youtube music', 'tidal', 'amazon music'],
  'Cloud e Storage': ['icloud', 'google one', 'google drive', 'dropbox', 'onedrive', 'microsoft 365', 'office', 'google workspace'],
  'Inteligência Artificial': ['chatgpt', 'openai', 'claude', 'anthropic', 'midjourney', 'copilot', 'github copilot', 'cursor', 'notion ai'],
  'Games': ['playstation', 'ps store', 'xbox', 'game pass', 'nintendo', 'steam', 'epic games', 'ubisoft', 'ea play', 'twitch'],

  // ========================================================
  // TRIBUTOS
  // ========================================================
  'IPVA': ['ipva'],
  'IPTU': ['iptu'],
  'IRPF': ['irpf', 'imposto de renda', 'darf', 'receita federal'],
  'Ganho de Capital': ['gcap', 'ganho capital', 'lucro venda'],
  'Taxas Profissionais': ['oab', 'cro', 'crm', 'crea', 'crf', 'anuidade', 'contribuicao sindical'],
  'Multas': ['multa', 'infração', 'auto infracao', 'detran multa'],
  'Seguro Incêndio': ['seguro incendio', 'seguro residencial'],
  'Outros Tributos': ['taxa', 'imposto', 'tributo', 'contribuicao'],

  // ========================================================
  // COMPRAS
  // ========================================================
  'Vestuário': ['roupa', 'sapato', 'tenis', 'bolsa', 'cinto', 'acessorio moda', 'renner', 'riachuelo', 'c&a', 'zara', 'centauro', 'netshoes', 'nike', 'adidas', 'puma'],
  'Presentes': ['presente', 'aniversario', 'natal', 'dia das maes', 'dia dos pais', 'casamento', 'doacao', 'gift'],
  'Eletrônicos': ['celular', 'smartphone', 'iphone', 'samsung', 'notebook', 'computador', 'tablet', 'ipad', 'fone', 'airpods', 'teclado', 'mouse', 'monitor', 'magazineluiza', 'magalu', 'americanas', 'casas bahia', 'fast shop', 'kabum', 'pichau', 'terabyte'],
  'Cuidados Pessoais': ['perfume', 'cosmetico', 'maquiagem', 'boticario', 'natura', 'avon', 'mac', 'sephora', 'oboticario'],

  // ========================================================
  // OUTROS
  // ========================================================
  'Taxas Bancárias': ['tarifa', 'iof', 'anuidade cartao', 'taxa banco', 'ted', 'doc', 'manutencao conta', 'saque', 'pacote servicos'],
  'Transferências': ['transferencia', 'pix enviado', 'ted enviado', 'pagamento'],
  'Não Identificado': [],
};

/**
 * Constrói um prompt otimizado para categorização com subcategorias
 * A IA deve escolher APENAS subcategorias (não categorias pai)
 */
export function buildCategorizationPrompt(
  transactions: ParsedTransaction[],
  categories: CategoryForAI[]
): string {
  // Filtrar apenas subcategorias (parent_id não nulo)
  const subcategories = categories.filter(c => c.parentId !== null && c.parentId !== undefined);

  // Lista detalhada de categorias com UUIDs e exemplos
  const categoryListDetailed = subcategories
    .map(c => {
      const keywords = categoryKeywords[c.name] || [];
      const parentInfo = c.parentName ? ` (${c.parentName})` : '';
      return `UUID: ${c.id} | ${c.name}${parentInfo} | Tipo: ${c.type} | Keywords: ${keywords.slice(0, 8).join(', ') || 'outros'}`;
    })
    .join('\n');

  // Lista de transações
  const transactionList = transactions
    .map((t, i) => `${i}. "${t.description}" | R$ ${Math.abs(t.amount).toFixed(2)} | ${t.type}`)
    .join('\n');

  return `Você é um categorizador especialista em transações bancárias brasileiras.

SISTEMA DE CATEGORIAS HIERÁRQUICO:
- Temos CATEGORIAS PAI (ex: Moradia, Transporte, Alimentação)
- E SUBCATEGORIAS mais específicas (ex: Habitação, Combustível, Supermercado)
- Você DEVE escolher APENAS SUBCATEGORIAS (nunca categorias pai)

SUBCATEGORIAS DISPONÍVEIS (use SOMENTE os UUIDs abaixo):

${categoryListDetailed}

TRANSAÇÕES PARA CATEGORIZAR:

${transactionList}

REGRAS DE CATEGORIZAÇÃO:
1. Para cada transação, escolha o UUID da SUBCATEGORIA mais apropriada
2. Use as keywords como guia para identificar padrões
3. Analise o nome do estabelecimento/descrição cuidadosamente
4. Considere o valor e tipo (income/expense) para desempatar
5. Se não tiver certeza, use "Não Identificado" (UUID: 20000000-0000-0000-0000-000000001003)
6. Retorne APENAS o JSON, sem markdown ou explicações

EXEMPLOS DE CATEGORIZAÇÃO:
- "UBER *TRIP" → Urbano (transporte por app)
- "PAG*JoseDaSilva" → Não Identificado (PIX genérico)
- "NETFLIX.COM" → Streaming TV
- "POSTO IPIRANGA" → Combustível
- "DROGASIL" → Farmácia
- "SMART FIT" → Cuidados e Bem-estar (academia)
- "PAG*SPOTIFY" → Música

FORMATO DE RESPOSTA OBRIGATÓRIO (JSON puro):
{
  "categories": [
    "uuid-da-categoria-0",
    "uuid-da-categoria-1",
    "uuid-da-categoria-2"
  ]
}

IMPORTANTE: O array "categories" DEVE ter exatamente ${transactions.length} elementos, um UUID para cada transação, na mesma ordem.`;
}

/**
 * Prompt simplificado para fallback (menos tokens)
 */
export function buildSimpleCategorizationPrompt(
  transactions: ParsedTransaction[],
  categories: CategoryForAI[]
): string {
  // Filtrar apenas subcategorias
  const subcategories = categories.filter(c => c.parentId !== null && c.parentId !== undefined);

  const categoryList = subcategories
    .map(c => `${c.id}:${c.name}`)
    .join('|');

  const txList = transactions
    .map((t, i) => `${i}."${t.description.slice(0, 40)}"`)
    .join('\n');

  return `Categorize transações bancárias BR.

CATEGORIAS (UUID:Nome): ${categoryList}

TRANSAÇÕES:
${txList}

Responda JSON: {"categories":["uuid0","uuid1",...]}
Total: ${transactions.length} UUIDs`;
}
