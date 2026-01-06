import type { Express, Response } from "express";
import { authMiddleware, type AuthenticatedRequest } from '../auth';
import { storage } from '../../core/infrastructure/supabaseStorage';
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { parseStatement } from './parsers/statementParser.js';
import { categorizeTransactions, categorizeBatch, detectTransactionType } from './ai/categorizer.js';
import { validateUUID } from '../../../shared/utils/validation';
import { logger } from '../../core/logger';
import { buildExtractionPrompt } from './ai/prompts';
import { postProcessTransactions } from './import.service';

// Configurar OpenAI (backup)
const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

// Configurar Gemini (primário)
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");

export function registerImportRoutes(app: Express) {
  // ============================================================================
  // NOVA ROTA OTIMIZADA - Parser Local + IA apenas para categorização
  // 5-10x mais rápida e 90% mais barata
  // ============================================================================
    app.post("/api/extract-transactions-fast", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    const startTime = Date.now();

    try {
      const { text, statementType } = req.body;
      const userId = req.userId!;

      if (!text) {
        return res.status(400).json({ error: "No text provided" });
      }

      logger.debug("\n⚡ MODO RÁPIDO ATIVADO - Parser Local + IA Categorização");
      logger.debug("═══════════════════════════════════════════════════════════");

      // PASSO 1: Parser local inteligente (RÁPIDO - sem IA)
      logger.debug("\n🔍 PASSO 1: Parsing local com regex...");
      const parseResult = parseStatement(text);

      logger.debug(`   ✓ Banco detectado: ${parseResult.bank}`);
      logger.debug(`   ✓ Tipo: ${parseResult.statementType}`);
      logger.debug(`   ✓ Transações encontradas: ${parseResult.transactions.length}`);
      logger.debug(`   ✓ Confiança: ${(parseResult.metadata.confidence * 100).toFixed(0)}%`);
      logger.debug(`   ✓ Método: ${parseResult.metadata.parsingMethod}`);

      if (parseResult.transactions.length === 0) {
        logger.debug("⚠️ Nenhuma transação encontrada pelo parser local");
        logger.debug("   Você pode tentar o método legado (/api/extract-transactions)");
        return res.json({
          transactions: [],
          metadata: {
            method: "fast_parser",
            bank: parseResult.bank,
            confidence: parseResult.metadata.confidence,
            warning: "Nenhuma transação detectada - tente o método legado"
          }
        });
      }

      // PASSO 2: Detectar tipo (income/expense) localmente
      logger.debug("\n🎯 PASSO 2: Detectando tipos de transação...");
      const transactionsWithTypes = parseResult.transactions.map(t => ({
        ...t,
        type: t.type || detectTransactionType(t.description),
      }));

      // PASSO 3: Buscar categorias do banco
      logger.debug("\n📂 PASSO 3: Carregando categorias do usuário...");
      const categories = await storage.getAllCategories(userId);
      logger.debug(`   ✓ ${categories.length} categorias disponíveis`);

      // PASSO 4: IA apenas para categorização (RÁPIDO - em lotes paralelos)
      logger.debug("\n🤖 PASSO 4: Categorizando com IA (lotes paralelos)...");
      const categorized = await categorizeBatch(
        transactionsWithTypes,
        categories.map(c => ({ id: c.id, name: c.name, type: c.type }))
      );
      logger.debug(`   ✓ ${categorized.length} transações categorizadas`);

      // PASSO 5: Processar cartões e membros da família (igual ao método antigo)
      logger.debug("\n💳 PASSO 5: Associando cartões e membros...");
      const processed = await postProcessTransactions(
        categorized as any[],
        statementType || parseResult.statementType,
        userId
      );

      // PASSO 6: Retornar categoryId E category name (para compatibilidade com frontend)
      const categoryMap = new Map(categories.map(c => [c.id, c.name]));
      const finalTransactions = processed.map(t => ({
        ...t,
        categoryId: t.categoryId,  // ✅ Incluir UUID
        category: categoryMap.get(t.categoryId) || "Outros",  // ✅ E nome
      }));

      const totalTime = Date.now() - startTime;
      logger.debug("\n✅ PROCESSAMENTO CONCLUÍDO!");
      logger.debug(`   ⏱️ Tempo total: ${totalTime}ms`);
      logger.debug(`   📊 Transações: ${finalTransactions.length}`);
      logger.debug(`   🏦 Banco: ${parseResult.bank}`);
      logger.debug("═══════════════════════════════════════════════════════════\n");

      return res.json({
        transactions: finalTransactions,
        metadata: {
          method: "fast_parser",
          bank: parseResult.bank,
          statementType: parseResult.statementType,
          totalTransactions: finalTransactions.length,
          processingTime: totalTime,
          confidence: parseResult.metadata.confidence,
          parsingMethod: parseResult.metadata.parsingMethod,
        }
      });

    } catch (error) {
      logger.error("❌ Erro no modo rápido:", error);
      return res.status(500).json({
        error: "Failed to extract transactions",
        details: error instanceof Error ? error.message : "Unknown error",
        suggestion: "Tente o método legado (/api/extract-transactions)"
      });
    }
  });

  // ============================================================================
  // ROTA LEGADA - Gemini AI Full Extraction (FALLBACK MANUAL)
  // ============================================================================
  // ATENÇÃO: Esta rota é MAIS LENTA (10-50x) e MAIS CARA que /extract-transactions-fast
  //
  // USO: Apenas como FALLBACK MANUAL quando:
  //   - Parser local Bradesco não consegue extrair transações
  //   - Banco não suportado pelo parser local
  //   - Necessário debugging de extração complexa
  //
  // FLUXO: Gemini 2.5 Flash → GPT-4o-mini (se falhar) → Fallback manual
  //
  // PRODUÇÃO: Frontend usa /api/extract-transactions-fast por padrão
  // FUTURO: Considerar remoção após 6 meses de produção sem falhas na rota fast
  // ============================================================================

  // ============================================================================
  // ROTA LEGADA - Gemini AI Full Extraction (FALLBACK MANUAL)
  // ============================================================================
  // ATENÇÃO: Esta rota é MAIS LENTA (10-50x) e MAIS CARA que /extract-transactions-fast
  //
  // USO: Apenas como FALLBACK MANUAL quando:
  //   - Parser local Bradesco não consegue extrair transações
  //   - Banco não suportado pelo parser local
  //   - Necessário debugging de extração complexa
  //
  // FLUXO: Gemini 2.5 Flash → GPT-4o-mini (se falhar) → Fallback manual
  //
  // PRODUÇÃO: Frontend usa /api/extract-transactions-fast por padrão
  // FUTURO: Considerar remoção após 6 meses de produção sem falhas na rota fast
  // ============================================================================
    app.post("/api/extract-transactions", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { text, statementType } = req.body;

      if (!text) {
        return res.status(400).json({ error: "No text provided" });
      }

      // PRÉ-PROCESSAMENTO: Detectar seções de cartão adicional (FALLBACK MANUAL)
      logger.debug("\n🔍 Detectando seções de cartão adicional...");
      const additionalCardHolders: string[] = [];
      const totalParaRegex = /Total para\s+([A-Z\s]+)/gi;
      let match;

      while ((match = totalParaRegex.exec(text)) !== null) {
        const holderName = match[1].trim();
        additionalCardHolders.push(holderName);
        logger.debug(`   👤 Detectado adicional: ${holderName}`);
      }

      if (additionalCardHolders.length > 0) {
        logger.debug(`✅ Total de ${additionalCardHolders.length} adicionais detectados manualmente`);
      }

      // Buscar categorias disponíveis para o prompt
      const userId = req.userId!;
      const categories = await storage.getAllCategories(userId);

      // Usar função centralizada para gerar prompt
      const prompt = buildExtractionPrompt(text, statementType, categories);

      // Tentar Gemini 2.5 Flash primeiro (50% mais barato)
      let content: string;
      let modelUsed: string;
      let finishReason: string;

      try {
        logger.debug("\n🚀 Tentando Gemini 2.5 Flash (primário)...");
        const model = genAI.getGenerativeModel({
          model: "gemini-2.5-flash",
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.1,
          }
        });

        const result = await model.generateContent(prompt);
        const response = result.response;
        content = response.text();
        modelUsed = "Gemini 2.5 Flash";
        finishReason = response.candidates?.[0]?.finishReason || "STOP";

        logger.debug("✅ Gemini 2.5 Flash respondeu com sucesso!");
      } catch (geminiError) {
        logger.warn("⚠️ Gemini falhou, usando GPT-4o Mini (backup)...");
        logger.warn("Erro do Gemini:", geminiError instanceof Error ? geminiError.message : String(geminiError));

        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
          max_completion_tokens: 16000,
          temperature: 0.1,
        });

        content = response.choices[0]?.message?.content || "{}";
        modelUsed = "GPT-4o Mini (backup)";
        finishReason = response.choices[0]?.finish_reason || "stop";
        logger.debug("✅ GPT-4o Mini respondeu com sucesso!");
      }

      // Log para debug
      logger.debug("\n=== RESPOSTA DA IA ===");
      logger.debug("Modelo usado:", modelUsed);
      logger.debug("Tamanho da resposta:", content.length);
      logger.debug("Finish reason:", finishReason);
      logger.debug("Primeiros 200 chars:", content.substring(0, 200));
      logger.debug("Últimos 200 chars:", content.substring(Math.max(0, content.length - 200)));

      let parsed;
      try {
        parsed = JSON.parse(content);
      } catch (parseError) {
        logger.error("\n=== ERRO DE PARSE JSON ===");
        logger.error("Erro:", parseError instanceof Error ? parseError.message : String(parseError));
        logger.error("Conteúdo completo da resposta:", content);
        logger.error("=== FIM DO ERRO DE PARSE ===\n");

        // Tentar recuperar JSON válido
        try {
          // Tentar encontrar o array de transactions dentro do texto
          const match = content.match(/\{[\s\S]*"transactions"[\s\S]*\[[\s\S]*\]/);
          if (match) {
            // Tentar fechar o JSON corretamente
            let fixedJson = match[0];
            if (!fixedJson.endsWith('}')) {
              fixedJson += '}';
            }
            parsed = JSON.parse(fixedJson);
            logger.debug("JSON recuperado com sucesso!");
          } else {
            throw new Error("Não foi possível recuperar JSON válido");
          }
        } catch (recoveryError) {
          logger.error("Falha ao recuperar JSON:", recoveryError);
          throw parseError; // Re-lançar erro original
        }
      }

      logger.debug("Número de transações extraídas:", parsed.transactions?.length || 0);

      // DEBUG: Verificar card_holder_name
      const withCardHolder = (parsed.transactions || []).filter((t: any) => t.card_holder_name);
      logger.debug(`   📋 Transações com card_holder_name: ${withCardHolder.length}`);
      if (withCardHolder.length > 0) {
        const uniqueNames = Array.from(new Set(withCardHolder.map((t: any) => t.card_holder_name)));
        logger.debug(`   👤 Nomes detectados: ${uniqueNames.join(', ')}`);
      }

      // FALLBACK: Se Gemini não detectou card_holder_name, usar detecção manual
      if (withCardHolder.length === 0 && additionalCardHolders.length > 0 && statementType === "credit_card") {
        logger.debug("\n⚠️ Gemini não detectou adicionais, aplicando fallback manual...");

        // Dividir texto em linhas e mapear transações para linhas aproximadas
        const lines = text.split('\n');
        let currentHolder: string | null = null;

        // Criar mapa de descrição -> holder
        const descriptionToHolder = new Map<string, string>();

        for (const line of lines) {
          const totalMatch = line.match(/Total para\s+([A-Z\s]+)/i);
          if (totalMatch) {
            currentHolder = totalMatch[1].trim();
            logger.debug(`   📍 Seção detectada: ${currentHolder}`);
            continue;
          }

          // Se estamos em uma seção de adicional, mapear todas as transações
          if (currentHolder) {
            // Procurar transações que contenham parte da linha
            (parsed.transactions || []).forEach((t: any) => {
              const desc = t.description?.toLowerCase() || '';
              const lineLower = line.toLowerCase();

              // Se a linha contém a descrição da transação
              if (lineLower.includes(desc.substring(0, 20)) && desc.length > 5 && currentHolder) {
                descriptionToHolder.set(t.description, currentHolder);
              }
            });
          }
        }

        // Aplicar mapeamento
        if (descriptionToHolder.size > 0) {
          logger.debug(`   ✅ ${descriptionToHolder.size} transações mapeadas manualmente`);
          (parsed.transactions || []).forEach((t: any) => {
            if (descriptionToHolder.has(t.description)) {
              t.card_holder_name = descriptionToHolder.get(t.description);
            }
          });
        }
      }
      logger.debug("=== FIM DA RESPOSTA ===\n");

      // Aplicar pós-processamento inteligente
      const processedTransactions = await postProcessTransactions(
        parsed.transactions || [],
        statementType,
        userId
      );

      logger.debug(`\n✨ Pós-processamento: ${parsed.transactions?.length || 0} → ${processedTransactions.length} transações`);

      res.json({ transactions: processedTransactions });
    } catch (error) {
      logger.error("\n=== ERRO AO EXTRAIR TRANSAÇÕES ===");
      logger.error("Tipo de erro:", error instanceof Error ? error.constructor.name : typeof error);

      if (error instanceof Error) {
        logger.error("Mensagem:", error.message);
        logger.error("Stack:", error.stack);
      }

      if (error && typeof error === 'object') {
        logger.error("Detalhes completos:", JSON.stringify(error, null, 2));
      }

      logger.error("=== FIM DO ERRO ===\n");

      res.status(500).json({ error: "Failed to extract transactions" });
    }
  });

}
