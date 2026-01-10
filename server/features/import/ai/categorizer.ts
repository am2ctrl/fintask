/**
 * IA Categorizer - Usa Gemini 2.5 Flash (tier 1) com fallback para GPT-4o-mini
 * Muito mais rápido e barato que processar PDFs inteiros
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import type { ParsedTransaction } from "../parsers/statementParser.js";
import { logger } from "../../../core/logger";
import { buildCategorizationPrompt } from './prompts/categorizationPrompt';

// Tipo simples de Category para uso em AI (apenas campos necessários)
export interface CategoryForAI {
  id: string;
  name: string;
  type: "income" | "expense";
  parentId?: string | null;
}

// Gemini 2.5 Flash - Principal (tier 1) - lazy initialization
let genAI: GoogleGenerativeAI | null = null;
let geminiModel: any = null;

function getGemini() {
  if (!genAI && process.env.GOOGLE_GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
    geminiModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  }
  return geminiModel;
}

// OpenAI GPT-4o-mini - Fallback (tier 2) - lazy initialization
let openai: OpenAI | null = null;

function getOpenAI() {
  if (!openai && process.env.AI_INTEGRATIONS_OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
      baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
    });
  }
  return openai;
}

export interface CategorizedTransaction extends ParsedTransaction {
  categoryId: string;
}

/**
 * Encontra categoria "Outros" apropriada do tipo correto
 * NUNCA retorna categories[0] para evitar fallback para "Alimentacao"
 */
function findOtherCategory(categories: CategoryForAI[], type: "income" | "expense"): string {
  // 1. Procurar "Outros Despesas" ou "Outros Receitas" (exato)
  const otherExact = categories.find(c =>
    c.name === (type === "expense" ? "Outros Despesas" : "Outros Receitas")
  );
  if (otherExact) return otherExact.id;

  // 2. Procurar qualquer categoria com "Outros" no nome do tipo correto
  const otherPartial = categories.find(c =>
    c.type === type && c.name.toLowerCase().includes("outros")
  );
  if (otherPartial) return otherPartial.id;

  // 3. Procurar QUALQUER categoria do tipo correto
  // (mas evitar pegar a primeira alfabeticamente)
  const anyOfType = categories.filter(c => c.type === type);
  if (anyOfType.length > 0) {
    // Pegar a ÚLTIMA ao invés da primeira (menos chance de ser "Alimentacao")
    return anyOfType[anyOfType.length - 1].id;
  }

  // 4. ÚLTIMO RECURSO: Lançar erro
  // É melhor falhar ruidosamente do que salvar dados incorretos
  throw new Error(`❌ CRÍTICO: Nenhuma categoria ${type} encontrada no sistema!`);
}

/**
 * Mapeia nomes de categorias para UUIDs
 * Resolve o problema da IA retornar nomes ao invés de UUIDs
 */
function mapCategoriesToUUIDs(
  categoriesFromAI: string[],
  validCategories: CategoryForAI[]
): string[] {
  const categoryNameMap = new Map<string, string>();
  const categoryIdSet = new Set<string>();

  // Criar mapeamento de nomes normalizados para UUIDs
  for (const cat of validCategories) {
    const normalized = cat.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    categoryNameMap.set(normalized, cat.id);
    categoryIdSet.add(cat.id);
  }

  // Mapear cada valor retornado pela IA
  return categoriesFromAI.map((value, index) => {
    // Se já é UUID válido, retornar direto
    if (categoryIdSet.has(value)) {
      return value;
    }

    // Se é nome, tentar mapear para UUID
    const normalized = value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const mappedId = categoryNameMap.get(normalized);

    if (mappedId) {
      logger.debug(`   🔄 Mapeado "${value}" → UUID`);
      return mappedId;
    }

    // Se não conseguiu mapear, retornar null (será tratado depois)
    logger.warn(`   ⚠️ Não conseguiu mapear "${value}"`);
    return "";
  });
}

/**
 * Processa transações em lotes paralelos para melhor performance
 * Divide em lotes de 15 e processa até 3 em paralelo
 */
export async function categorizeBatch(
  transactions: ParsedTransaction[],
  categories: CategoryForAI[],
  batchSize: number = 15
): Promise<CategorizedTransaction[]> {
  if (transactions.length === 0) return [];

  // Para menos de 20 transações, processar direto (não vale a pena dividir)
  if (transactions.length < 20) {
    return categorizeTransactions(transactions, categories);
  }

  // Dividir em lotes
  const batches: ParsedTransaction[][] = [];
  for (let i = 0; i < transactions.length; i += batchSize) {
    batches.push(transactions.slice(i, i + batchSize));
  }

  // ⚡ OTIMIZAÇÃO: Logging simplificado (só início e fim)
  logger.debug(`   🔍 Categorizando ${transactions.length} transações em ${batches.length} lotes paralelos...`);

  // Processar 3 lotes por vez em paralelo
  const results: CategorizedTransaction[][] = [];

  for (let i = 0; i < batches.length; i += 3) {
    const currentBatches = batches.slice(i, i + 3);

    const batchPromises = currentBatches.map(batch =>
      categorizeTransactions(batch, categories)
    );

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
  }

  logger.debug(`   ✅ Categorização concluída!`);
  return results.flat();
}

/**
 * Categoriza um lote de transações usando IA com sistema de fallback
 * Tier 1: Gemini 2.5 Flash → Tier 2: GPT-4o-mini → Tier 3: Categorização local
 */
export async function categorizeTransactions(
  transactions: ParsedTransaction[],
  categories: CategoryForAI[]
): Promise<CategorizedTransaction[]> {
  // Se não há transações, retorna vazio
  if (transactions.length === 0) {
    return [];
  }

  // Construir prompt mínimo e eficiente
  const prompt = buildCategorizationPrompt(transactions, categories);

  // TIER 1: Tentar Gemini 2.5 Flash primeiro
  try {
    logger.debug("   🤖 Tentando Gemini 2.5 Flash...");
    const model = getGemini();  // Initialize Gemini client
    if (!model) {
      throw new Error("Gemini API key not configured");
    }
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Parse da resposta JSON
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Gemini não retornou JSON válido");
    }

    const response = JSON.parse(jsonMatch[0]);

    // Validar estrutura da resposta
    if (!response.categories || !Array.isArray(response.categories)) {
      throw new Error("Resposta da IA não tem array 'categories'");
    }

    logger.debug(`   📊 IA retornou ${response.categories.length} categorias`);
    logger.debug(`   📊 Primeiras 3:`, response.categories.slice(0, 3));

    // Mapear nomes para UUIDs (se IA retornou nomes ao invés de UUIDs)
    const mappedCategories = mapCategoriesToUUIDs(response.categories, categories);

    logger.debug("   ✅ Gemini 2.5 Flash categorizou com sucesso!");

    // Mapear categorias para as transações
    return transactions.map((transaction, index) => {
      const categoryId = mappedCategories[index];
      return {
        ...transaction,
        categoryId: categoryId || findOtherCategory(categories, transaction.type),
      };
    });
  } catch (geminiError) {
    logger.error("   ❌ Gemini falhou:", geminiError instanceof Error ? geminiError.message : geminiError);

    // TIER 2: Fallback para GPT-4o-mini
    try {
      logger.debug("   🔄 Tentando GPT-4o-mini (fallback tier 2)...");

      const client = getOpenAI();  // Initialize OpenAI client
      if (!client) {
        throw new Error("OpenAI API key not configured");
      }
      const gptResponse = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{
          role: "user",
          content: prompt
        }],
        temperature: 0.3,
      });

      const responseText = gptResponse.choices[0].message.content || "";
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        throw new Error("GPT não retornou JSON válido");
      }

      const response = JSON.parse(jsonMatch[0]);

      // Validar estrutura da resposta
      if (!response.categories || !Array.isArray(response.categories)) {
        throw new Error("Resposta da IA não tem array 'categories'");
      }

      logger.debug(`   📊 GPT retornou ${response.categories.length} categorias`);

      // Mapear nomes para UUIDs (se IA retornou nomes ao invés de UUIDs)
      const mappedCategories = mapCategoriesToUUIDs(response.categories, categories);

      logger.debug("   ✅ GPT-4o-mini categorizou com sucesso!");

      return transactions.map((transaction, index) => {
        const categoryId = mappedCategories[index];
        return {
          ...transaction,
          categoryId: categoryId || findOtherCategory(categories, transaction.type),
        };
      });
    } catch (gptError) {
      logger.error("   ❌ GPT-4o-mini falhou:", gptError instanceof Error ? gptError.message : gptError);

      // FALLBACK: Usar categoria "Outros" quando ambas IAs falharem
      logger.warn("   ⚠️ Ambas IAs falharam - usando categoria 'Outros' como fallback");
      return transactions.map(transaction => {
        const categoryId = findOtherCategory(categories, transaction.type);
        logger.warn(`   ⚠️ Categorização AI falhou para "${transaction.description}" - usando categoria "Outros"`);
        return {
          ...transaction,
          categoryId,
        };
      });
    }
  }
}

/**
 * Categoriza uma única transação (para edições manuais)
 */
export async function categorizeSingleTransaction(
  description: string,
  categories: CategoryForAI[]
): Promise<string> {
  const dummyTransaction: ParsedTransaction = {
    date: "2025-01-01",
    description,
    amount: 0,
    type: "expense",
  };

  const result = await categorizeTransactions([dummyTransaction], categories);
  return result[0].categoryId;
}

/**
 * Categorização local inteligente usando palavras-chave
 * Usado como fallback quando Gemini não está disponível
 */
/**
 * @deprecated Não usar mais. Mantido apenas para referência histórica.
 * Use AI categorization (Gemini/GPT) sempre.
 */

/**
 * Detecta tipo de transação (income/expense) baseado em keywords
 * Usado para pré-processar antes de enviar para Gemini
 */
export function detectTransactionType(description: string): "income" | "expense" {
  const incomeKeywords = [
    /salário/i,
    /salario/i,
    /pix recebido/i,
    /ted recebido/i,
    /transferência recebida/i,
    /depósito/i,
    /deposito/i,
    /estorno/i,
    /reembolso/i,
    /cashback/i,
    /devolução/i,
    /devolucao/i,
  ];

  for (const pattern of incomeKeywords) {
    if (pattern.test(description)) {
      return "income";
    }
  }

  return "expense";
}
