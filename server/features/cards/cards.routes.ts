import type { Express, Response } from "express";
import {
  authMiddleware,
  familyAuthMiddleware,
  requireFamilyGroup,
  checkPermission,
  type FamilyAuthenticatedRequest,
} from '../auth';
import { storage } from '../../core/infrastructure/supabaseStorage';
import { validateUUID } from '../../../shared/utils/validation';
import { logger } from '../../core/logger';

export function registerCardRoutes(app: Express) {
  app.get("/api/credit-cards", authMiddleware, familyAuthMiddleware, requireFamilyGroup, async (req: FamilyAuthenticatedRequest, res: Response) => {
    try {
      const familyGroupId = req.familyGroupId!;

      // Get cards for the entire family group
      const cards = await storage.getAllCreditCardsByFamilyGroup(familyGroupId);

      // Add permission info to each card
      const cardsWithPermissions = cards.map(card => ({
        ...card,
        canEdit: checkPermission(req, 'credit_card', 'update', card.createdByUserId).allowed,
        canDelete: checkPermission(req, 'credit_card', 'delete', card.createdByUserId).allowed,
      }));

      res.json(cardsWithPermissions);
    } catch (error) {
      logger.error("Error fetching credit cards:", error);
      res.status(500).json({ error: "Failed to fetch credit cards" });
    }
  });

  app.post("/api/credit-cards", authMiddleware, familyAuthMiddleware, requireFamilyGroup, async (req: FamilyAuthenticatedRequest, res: Response) => {
    try {
      const userId = req.userId!;
      const familyGroupId = req.familyGroupId!;

      const card = await storage.createCreditCardWithFamily({
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
      }, userId, familyGroupId);

      res.json(card);
    } catch (error) {
      logger.error("Error creating credit card:", error);
      res.status(500).json({ error: "Failed to create credit card" });
    }
  });

  app.patch("/api/credit-cards/:id", authMiddleware, familyAuthMiddleware, requireFamilyGroup, async (req: FamilyAuthenticatedRequest, res: Response) => {
    try {
      const familyGroupId = req.familyGroupId!;

      // Get the card to check ownership
      const existingCard = await storage.getCreditCardWithOwnership(req.params.id);
      if (!existingCard) {
        return res.status(404).json({ error: "Cartao nao encontrado" });
      }

      // Check if card belongs to this family group
      if (existingCard.familyGroupId !== familyGroupId) {
        return res.status(404).json({ error: "Cartao nao encontrado" });
      }

      // Check permission to edit
      const permission = checkPermission(req, 'credit_card', 'update', existingCard.createdByUserId);
      if (!permission.allowed) {
        return res.status(403).json({ error: permission.message });
      }

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

  app.delete("/api/credit-cards/:id", authMiddleware, familyAuthMiddleware, requireFamilyGroup, async (req: FamilyAuthenticatedRequest, res: Response) => {
    try {
      const userId = req.userId!;
      const familyGroupId = req.familyGroupId!;

      // Get the card to check ownership
      const existingCard = await storage.getCreditCardWithOwnership(req.params.id);
      if (!existingCard) {
        return res.status(404).json({ error: "Cartao nao encontrado" });
      }

      // Check if card belongs to this family group
      if (existingCard.familyGroupId !== familyGroupId) {
        return res.status(404).json({ error: "Cartao nao encontrado" });
      }

      // Check permission to delete
      const permission = checkPermission(req, 'credit_card', 'delete', existingCard.createdByUserId);

      if (permission.allowed) {
        // Admin can delete directly
        await storage.deleteCreditCard(req.params.id);
        res.json({ success: true });
      } else if (permission.requiresApproval) {
        // Member needs to create a deletion request
        const deletionRequest = await storage.createDeletionRequest({
          familyGroupId,
          resourceType: 'credit_card',
          resourceId: req.params.id,
          requestedByUserId: userId,
          reason: req.body.reason,
        });
        res.json({
          success: false,
          requiresApproval: true,
          deletionRequest,
          message: "Solicitacao de exclusao enviada para aprovacao do administrador"
        });
      } else {
        return res.status(403).json({ error: permission.message });
      }
    } catch (error) {
      logger.error("Error deleting credit card:", error);
      res.status(500).json({ error: "Failed to delete credit card" });
    }
  });

  // Family Members routes
}
