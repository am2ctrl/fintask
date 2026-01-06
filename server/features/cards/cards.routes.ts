import type { Express, Response } from "express";
import { authMiddleware, type AuthenticatedRequest } from '../auth';
import { storage } from '../../core/infrastructure/supabaseStorage';
import { validateUUID } from '../../../shared/utils/validation';
import { logger } from '../../core/logger';

export function registerCardRoutes(app: Express) {
  app.get("/api/credit-cards", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.userId!;
      const cards = await storage.getAllCreditCards(userId);
      res.json(cards);
    } catch (error) {
      logger.error("Error fetching credit cards:", error);
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
      logger.error("Error creating credit card:", error);
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
      logger.error("Error updating credit card:", error);
      res.status(500).json({ error: "Failed to update credit card" });
    }
  });

  app.delete("/api/credit-cards/:id", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      await storage.deleteCreditCard(req.params.id);
      res.json({ success: true });
    } catch (error) {
      logger.error("Error deleting credit card:", error);
      res.status(500).json({ error: "Failed to delete credit card" });
    }
  });

  // Family Members routes
}
