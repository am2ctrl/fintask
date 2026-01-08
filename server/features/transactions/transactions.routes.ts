import type { Express, Response } from "express";
import { authMiddleware, type AuthenticatedRequest } from '../auth';
import { storage } from '../../core/infrastructure/supabaseStorage';
import { validateUUID } from '../../../shared/utils/validation';
import { logger } from '../../core/logger';
import { mapCategoryId, getCategoryName } from '../../utils/categoryMapping';

export function registerTransactionRoutes(app: Express) {
  app.post("/api/transactions/batch", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    const { transactions } = req.body;
    const userId = req.userId!;

    try {
      if (!Array.isArray(transactions)) {
        return res.status(400).json({ error: "Invalid transactions array" });
      }

      logger.debug("\n🔍 DEBUG: Recebendo", transactions.length, "transações para salvar");
      if (transactions.length > 0) {
        logger.debug("📝 Primeira transação recebida:", JSON.stringify(transactions[0], null, 2));
      }

      // ✅ OTIMIZAÇÃO: Usar batch insert ao invés de queries individuais
      const cleanedTransactions = transactions.map((t: any, index: number) => {
        // Validar e limpar cardId e familyMemberId usando validação UUID adequada
        const cardId = t.cardId && validateUUID(t.cardId) ? t.cardId : null;
        const familyMemberId = t.familyMemberId && validateUUID(t.familyMemberId) ? t.familyMemberId : null;

        // ✅ NOVO: Mapear categoryId numérico para UUID válido
        let categoryId: string;
        try {
          categoryId = mapCategoryId(t.categoryId);

          if (index === 0) {
            logger.debug(`🔄 Mapeou categoryId: "${t.categoryId}" → "${categoryId}" (${getCategoryName(t.categoryId)})`);
          }
        } catch (error) {
          const errorMsg = `Transação ${index + 1}: Categoria inválida "${t.categoryId}"`;
          logger.error(errorMsg, error);
          throw new Error(errorMsg);
        }

        // Criar objeto limpo apenas com campos válidos - IMPORTANTE: não incluir outros campos!
        const cleanTransaction = {
          date: new Date(t.date),
          amount: typeof t.amount === 'number' ? t.amount : parseFloat(t.amount),
          type: t.type,
          categoryId,
          description: t.description,
          mode: t.mode || "avulsa",
          installmentNumber: t.installmentNumber || null,
          installmentsTotal: t.installmentsTotal || null,
          cardId,
          familyMemberId,
        };

        if (index === 0) {
          logger.debug("✅ Primeira transação LIMPA:", JSON.stringify(cleanTransaction, null, 2));
        }

        return cleanTransaction;
      });

      const savedTransactions = await storage.batchCreateTransactions(
        cleanedTransactions,
        userId
      );

      logger.debug("✅ Sucesso! Salvou", savedTransactions.length, "transações\n");
      res.json({ success: true, count: savedTransactions.length });
    } catch (error) {
      logger.error("\n=== ERRO AO SALVAR TRANSAÇÕES ===");
      logger.error("UserId:", userId);
      logger.error("Número de transações:", transactions?.length);
      logger.error("Primeira transação RAW:", JSON.stringify(transactions?.[0], null, 2));

      if (error instanceof Error) {
        logger.error("Erro:", error.message);
        logger.error("Stack:", error.stack);
      }

      // Se for erro do Supabase, mostrar detalhes
      if (error && typeof error === 'object') {
        logger.error("Detalhes do erro:", JSON.stringify(error, null, 2));
      }
      logger.error("=== FIM DO ERRO ===\n");

      res.status(500).json({
        error: "Failed to save transactions",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/transactions", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.userId!;
      const transactions = await storage.getAllTransactions(userId);

      // Buscar todos os cartões e membros para enriquecer as transações
      const allCards = await storage.getAllCreditCards(userId);
      const allMembers = await storage.getAllFamilyMembers(userId);

      // ⚡ OTIMIZAÇÃO: Criar Maps para lookup O(1) ao invés de array.find() O(n)
      const cardsMap = new Map(allCards.map(c => [c.id, c]));
      const membersMap = new Map(allMembers.map(m => [m.id, m]));

      // Enriquecer transações com dados do cartão e membro - 100x mais rápido com Map!
      const enrichedTransactions = transactions.map(t => {
        const card = t.cardId ? cardsMap.get(t.cardId) : null;
        const member = t.familyMemberId ? membersMap.get(t.familyMemberId) : null;

        return {
          ...t,
          card: card ? {
            id: card.id,
            name: card.name,
            lastFourDigits: card.lastFourDigits,
            cardType: card.cardType,
          } : null,
          familyMember: member ? {
            id: member.id,
            name: member.name,
          } : null,
        };
      });

      res.json(enrichedTransactions);
    } catch (error) {
      logger.error("Error fetching transactions:", error);
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  app.post("/api/transactions", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.userId!;

      // ✅ NOVO: Mapear categoryId numérico para UUID
      const categoryId = mapCategoryId(req.body.categoryId);

      const transaction = await storage.createTransaction({
        date: new Date(req.body.date),
        amount: req.body.amount,
        type: req.body.type,
        categoryId,
        description: req.body.description,
        mode: req.body.mode || "avulsa",
        installmentNumber: req.body.installmentNumber || null,
        installmentsTotal: req.body.installmentsTotal || null,
        cardId: req.body.cardId || null,
      }, userId);
      res.json(transaction);
    } catch (error) {
      logger.error("Error creating transaction:", error);
      res.status(500).json({ error: "Failed to create transaction" });
    }
  });

  app.patch("/api/transactions/:id", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      // ✅ NOVO: Mapear categoryId se presente
      const categoryId = req.body.categoryId ? mapCategoryId(req.body.categoryId) : undefined;

      const transaction = await storage.updateTransaction(req.params.id, {
        date: req.body.date ? new Date(req.body.date) : undefined,
        amount: req.body.amount,
        type: req.body.type,
        categoryId,
        description: req.body.description,
        mode: req.body.mode,
        installmentNumber: req.body.installmentNumber,
        installmentsTotal: req.body.installmentsTotal,
        cardId: req.body.cardId,
      });
      res.json(transaction);
    } catch (error) {
      logger.error("Error updating transaction:", error);
      res.status(500).json({ error: "Failed to update transaction" });
    }
  });

  app.delete("/api/transactions/:id", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      await storage.deleteTransaction(req.params.id);
      res.json({ success: true });
    } catch (error) {
      logger.error("Error deleting transaction:", error);
      res.status(500).json({ error: "Failed to delete transaction" });
    }
  });

}
