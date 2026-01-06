import type { Express, Response } from "express";
import { authMiddleware, type AuthenticatedRequest } from '../auth';
import { storage } from '../../core/infrastructure/supabaseStorage';
import { validateUUID } from '../../../shared/utils/validation';
import { logger } from '../../core/logger';

export function registerFamilyRoutes(app: Express) {
  app.get("/api/family-members", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.userId!;
      const members = await storage.getAllFamilyMembers(userId);
      res.json(members);
    } catch (error) {
      logger.error("Error fetching family members:", error);
      res.status(500).json({ error: "Failed to fetch family members" });
    }
  });

  app.post("/api/family-members", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.userId!;
      const member = await storage.createFamilyMember(req.body, userId);
      res.json(member);
    } catch (error) {
      logger.error("Error creating family member:", error);
      res.status(500).json({ error: "Failed to create family member" });
    }
  });

  app.patch("/api/family-members/:id", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const member = await storage.updateFamilyMember(req.params.id, req.body);
      res.json(member);
    } catch (error) {
      logger.error("Error updating family member:", error);
      res.status(500).json({ error: "Failed to update family member" });
    }
  });

  app.delete("/api/family-members/:id", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      await storage.deleteFamilyMember(req.params.id);
      res.json({ success: true });
    } catch (error) {
      logger.error("Error deleting family member:", error);
      res.status(500).json({ error: "Failed to delete family member" });
    }
  });


}
