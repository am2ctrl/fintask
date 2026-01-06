import type { ParsedTransaction } from '../../parsers/statementParser';

// Tipo simples de Category para uso em AI
interface CategoryForAI {
  id: string;
  name: string;
  type: "income" | "expense";
}

/**
 * Constrói um prompt otimizado para categorização
 * Força a IA a retornar UUIDs ao invés de nomes
 */
export function buildCategorizationPrompt(
  transactions: ParsedTransaction[],
  categories: CategoryForAI[]
): string {
  // Criar mapa de exemplos de keywords por categoria
  const categoryExamples: Record<string, string[]> = {
    'Alimentacao': ['supermercado', 'restaurante', 'delivery', 'pizza', 'ifood'],
    'Saude': ['farmacia', 'medico', 'hospital', 'clinica'],
    'Transporte': ['posto', 'combustivel', 'uber', 'estacionamento'],
    'Educacao': ['mba', 'faculdade', 'curso'],
    'Streaming': ['spotify', 'netflix', 'apple', 'disney'],
    'Compras': ['amazon', 'marketplace', 'loja'],
    'Lazer': ['bar', 'pub', 'cinema', 'diversoes'],
    'Banco': ['tarifa', 'iof', 'anuidade', 'seguro'],
  };

  // Lista detalhada de categorias com UUIDs e exemplos
  const categoryListDetailed = categories
    .map(c => {
      const examples = categoryExamples[c.name] || [];
      return `UUID: ${c.id} | Nome: ${c.name} | Tipo: ${c.type} | Ex: ${examples.join(', ') || 'outros'}`;
    })
    .join('\n');

  // Lista de transações
  const transactionList = transactions
    .map((t, i) => `${i}. "${t.description}"`)
    .join('\n');

  return `Você é um categorizador de transações bancárias brasileiras.

IMPORTANTE: Você DEVE retornar os UUIDs das categorias, NÃO os nomes!

CATEGORIAS DISPONÍVEIS (use APENAS os UUIDs abaixo):

${categoryListDetailed}

TRANSAÇÕES PARA CATEGORIZAR:

${transactionList}

INSTRUÇÕES:
1. Para cada transação, escolha o UUID da categoria mais apropriada
2. Use os exemplos de palavras-chave para ajudar na decisão
3. Retorne APENAS o JSON no formato abaixo (sem markdown, sem explicações)

FORMATO DE RESPOSTA OBRIGATÓRIO:
{
  "categories": [
    "uuid-da-categoria-0",
    "uuid-da-categoria-1",
    "uuid-da-categoria-2"
  ]
}

ATENÇÃO: O array "categories" DEVE ter exatamente ${transactions.length} elementos, um UUID para cada transação, na mesma ordem.`;
}
