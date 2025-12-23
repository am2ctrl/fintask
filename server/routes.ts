import type { Express, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./supabaseStorage";
import { authMiddleware, type AuthenticatedRequest } from "./authMiddleware";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.post("/api/extract-transactions", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { text, statementType } = req.body;

      if (!text) {
        return res.status(400).json({ error: "No text provided" });
      }

      const isChecking = statementType === "checking";
      const statementContext = isChecking
        ? `Este é um EXTRATO DE CONTA CORRENTE. As transações típicas incluem:
           - Receitas: Salários, PIX recebidos, TED recebidos, depósitos
           - Despesas: PIX enviados, TED enviados, pagamentos de boletos, débitos automáticos, tarifas bancárias`
        : `Esta é uma FATURA DE CARTÃO DE CRÉDITO. As transações típicas incluem:
           - Despesas: Compras em lojas, restaurantes, serviços online, assinaturas, parcelas
           - Receitas (estornos): Devoluções, cashback, reembolsos, cancelamentos
           IMPORTANTE: Na fatura de cartão, valores NEGATIVOS geralmente são estornos/reembolsos (marque como income).`;

      const prompt = `Você é um assistente especializado em extrair transações financeiras de extratos bancários brasileiros.

${statementContext}

Analise o seguinte texto e extraia todas as transações. Para cada transação, identifique:
1. A data (formato YYYY-MM-DD)
2. A descrição original
3. O valor (número positivo, sem sinal)
4. O tipo ("income" para receita/crédito/estorno ou "expense" para despesa/débito/compra)
5. A categoria sugerida (escolha entre: Salário, Freelance, Investimentos, Outros, Alimentação, Transporte, Moradia, Saúde, Educação, Lazer, Contas, Compras)
6. Um nível de confiança de 0 a 1 na classificação
7. O modo da transação: "avulsa" (compra única), "recorrente" (mensalidade fixa como Netflix, aluguel), ou "parcelada" (compra dividida em parcelas)
8. Se for parcelada, identifique o número da parcela atual e o total de parcelas

Regras de classificação:
- PIX RECEBIDO, TED RECEBIDO, SALARIO, CREDITO = income
- PIX ENVIADO, PAGAMENTO, DEBITO, COMPRA = expense
- ESTORNO, DEVOLUCAO, CASHBACK, REEMBOLSO = income
- Compras em supermercados = Alimentação
- UBER, 99, TAXI, COMBUSTIVEL, POSTO = Transporte
- NETFLIX, SPOTIFY, CINEMA = Lazer
- FARMACIA, DROGARIA, HOSPITAL = Saúde
- ALUGUEL, CONDOMINIO, LUZ, AGUA, GAS = Moradia ou Contas

Regras de modo:
- NETFLIX, SPOTIFY, AMAZON PRIME, DISNEY+, ACADEMIA, PLANO, MENSALIDADE = recorrente
- Texto contém "PARCELA", "X/Y", "1/12", "2/10" etc = parcelada (extraia número atual e total)
- Outros = avulsa

Retorne APENAS um JSON válido no seguinte formato:
{
  "transactions": [
    {
      "date": "2024-12-15",
      "description": "SUPERMERCADO XYZ",
      "amount": 150.50,
      "type": "expense",
      "category": "Alimentação",
      "confidence": 0.95,
      "mode": "avulsa",
      "installmentNumber": null,
      "installmentsTotal": null
    },
    {
      "date": "2024-12-10",
      "description": "CASAS BAHIA PARCELA 3/10",
      "amount": 299.90,
      "type": "expense",
      "category": "Compras",
      "confidence": 0.98,
      "mode": "parcelada",
      "installmentNumber": 3,
      "installmentsTotal": 10
    }
  ]
}

Texto do extrato:
${text.substring(0, 10000)}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_completion_tokens: 4096,
      });

      const content = response.choices[0]?.message?.content || "{}";
      const parsed = JSON.parse(content);

      res.json(parsed);
    } catch (error) {
      console.error("Error extracting transactions:", error);
      res.status(500).json({ error: "Failed to extract transactions" });
    }
  });

  app.post("/api/transactions/batch", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { transactions } = req.body;
      const userId = req.userId!;

      if (!Array.isArray(transactions)) {
        return res.status(400).json({ error: "Invalid transactions array" });
      }

      const savedTransactions = await Promise.all(
        transactions.map((t: any) =>
          storage.createTransaction({
            date: new Date(t.date),
            amount: t.amount,
            type: t.type,
            categoryId: t.categoryId,
            description: t.description,
            mode: t.mode || "avulsa",
            installmentNumber: t.installmentNumber || null,
            installmentsTotal: t.installmentsTotal || null,
            cardId: t.cardId || null,
          }, userId)
        )
      );

      res.json({ success: true, count: savedTransactions.length });
    } catch (error) {
      console.error("Error saving transactions:", error);
      res.status(500).json({ error: "Failed to save transactions" });
    }
  });

  app.get("/api/transactions", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.userId!;
      const transactions = await storage.getAllTransactions(userId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  app.post("/api/transactions", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.userId!;
      const transaction = await storage.createTransaction({
        date: new Date(req.body.date),
        amount: req.body.amount,
        type: req.body.type,
        categoryId: req.body.categoryId,
        description: req.body.description,
        mode: req.body.mode || "avulsa",
        installmentNumber: req.body.installmentNumber || null,
        installmentsTotal: req.body.installmentsTotal || null,
        cardId: req.body.cardId || null,
      }, userId);
      res.json(transaction);
    } catch (error) {
      console.error("Error creating transaction:", error);
      res.status(500).json({ error: "Failed to create transaction" });
    }
  });

  app.patch("/api/transactions/:id", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const transaction = await storage.updateTransaction(req.params.id, {
        date: req.body.date ? new Date(req.body.date) : undefined,
        amount: req.body.amount,
        type: req.body.type,
        categoryId: req.body.categoryId,
        description: req.body.description,
        mode: req.body.mode,
        installmentNumber: req.body.installmentNumber,
        installmentsTotal: req.body.installmentsTotal,
        cardId: req.body.cardId,
      });
      res.json(transaction);
    } catch (error) {
      console.error("Error updating transaction:", error);
      res.status(500).json({ error: "Failed to update transaction" });
    }
  });

  app.delete("/api/transactions/:id", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      await storage.deleteTransaction(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting transaction:", error);
      res.status(500).json({ error: "Failed to delete transaction" });
    }
  });

  app.get("/api/categories", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.userId!;
      const categories = await storage.getAllCategories(userId);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.userId!;
      const category = await storage.createCategory({
        name: req.body.name,
        type: req.body.type,
        color: req.body.color,
        icon: req.body.icon || null,
      }, userId);
      res.json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ error: "Failed to create category" });
    }
  });

  app.patch("/api/categories/:id", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const category = await storage.updateCategory(req.params.id, {
        name: req.body.name,
        type: req.body.type,
        color: req.body.color,
        icon: req.body.icon,
      });
      res.json(category);
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(500).json({ error: "Failed to update category" });
    }
  });

  app.delete("/api/categories/:id", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      await storage.deleteCategory(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ error: "Failed to delete category" });
    }
  });

  app.get("/api/credit-cards", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.userId!;
      const cards = await storage.getAllCreditCards(userId);
      res.json(cards);
    } catch (error) {
      console.error("Error fetching credit cards:", error);
      res.status(500).json({ error: "Failed to fetch credit cards" });
    }
  });

  app.post("/api/credit-cards", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.userId!;
      const card = await storage.createCreditCard({
        name: req.body.name,
        lastFourDigits: req.body.lastFourDigits,
        cardType: req.body.cardType,
        holder: req.body.holder,
        purpose: req.body.purpose,
        color: req.body.color,
        icon: req.body.icon,
        limit: req.body.limit || null,
        closingDay: req.body.closingDay || null,
        dueDay: req.body.dueDay || null,
      }, userId);
      res.json(card);
    } catch (error) {
      console.error("Error creating credit card:", error);
      res.status(500).json({ error: "Failed to create credit card" });
    }
  });

  app.patch("/api/credit-cards/:id", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const card = await storage.updateCreditCard(req.params.id, {
        name: req.body.name,
        lastFourDigits: req.body.lastFourDigits,
        cardType: req.body.cardType,
        holder: req.body.holder,
        purpose: req.body.purpose,
        color: req.body.color,
        icon: req.body.icon,
        limit: req.body.limit,
        closingDay: req.body.closingDay,
        dueDay: req.body.dueDay,
      });
      res.json(card);
    } catch (error) {
      console.error("Error updating credit card:", error);
      res.status(500).json({ error: "Failed to update credit card" });
    }
  });

  app.delete("/api/credit-cards/:id", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      await storage.deleteCreditCard(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting credit card:", error);
      res.status(500).json({ error: "Failed to delete credit card" });
    }
  });

  return httpServer;
}
