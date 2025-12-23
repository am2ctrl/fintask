import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.post("/api/extract-transactions", async (req, res) => {
    try {
      const { text, fileName, statementType } = req.body;

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

Regras de classificação:
- PIX RECEBIDO, TED RECEBIDO, SALARIO, CREDITO = income
- PIX ENVIADO, PAGAMENTO, DEBITO, COMPRA = expense
- ESTORNO, DEVOLUCAO, CASHBACK, REEMBOLSO = income
- Compras em supermercados = Alimentação
- UBER, 99, TAXI, COMBUSTIVEL, POSTO = Transporte
- NETFLIX, SPOTIFY, CINEMA = Lazer
- FARMACIA, DROGARIA, HOSPITAL = Saúde
- ALUGUEL, CONDOMINIO, LUZ, AGUA, GAS = Moradia ou Contas

Retorne APENAS um JSON válido no seguinte formato:
{
  "transactions": [
    {
      "date": "2024-12-15",
      "description": "SUPERMERCADO XYZ",
      "amount": 150.50,
      "type": "expense",
      "category": "Alimentação",
      "confidence": 0.95
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

  app.post("/api/transactions/batch", async (req, res) => {
    try {
      const { transactions } = req.body;

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
          })
        )
      );

      res.json({ success: true, count: savedTransactions.length });
    } catch (error) {
      console.error("Error saving transactions:", error);
      res.status(500).json({ error: "Failed to save transactions" });
    }
  });

  app.get("/api/transactions", async (req, res) => {
    try {
      const transactions = await storage.getAllTransactions();
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      const transaction = await storage.createTransaction({
        date: new Date(req.body.date),
        amount: req.body.amount,
        type: req.body.type,
        categoryId: req.body.categoryId,
        description: req.body.description,
      });
      res.json(transaction);
    } catch (error) {
      console.error("Error creating transaction:", error);
      res.status(500).json({ error: "Failed to create transaction" });
    }
  });

  app.patch("/api/transactions/:id", async (req, res) => {
    try {
      const transaction = await storage.updateTransaction(req.params.id, {
        date: req.body.date ? new Date(req.body.date) : undefined,
        amount: req.body.amount,
        type: req.body.type,
        categoryId: req.body.categoryId,
        description: req.body.description,
      });
      res.json(transaction);
    } catch (error) {
      console.error("Error updating transaction:", error);
      res.status(500).json({ error: "Failed to update transaction" });
    }
  });

  app.delete("/api/transactions/:id", async (req, res) => {
    try {
      await storage.deleteTransaction(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting transaction:", error);
      res.status(500).json({ error: "Failed to delete transaction" });
    }
  });

  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  return httpServer;
}
