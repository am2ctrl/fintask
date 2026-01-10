import type { Express, Response } from "express";
import {
  authMiddleware,
  familyAuthMiddleware,
  requireFamilyGroup,
  requireAdmin,
  checkPermission,
  type FamilyAuthenticatedRequest,
} from '../auth';
import { storage } from '../../core/infrastructure/supabaseStorage';
import { validateUUID } from '../../../shared/utils/validation';
import { logger } from '../../core/logger';

export function registerCategoryRoutes(app: Express) {
  app.get("/api/categories", authMiddleware, familyAuthMiddleware, requireFamilyGroup, async (req: FamilyAuthenticatedRequest, res: Response) => {
    try {
      const familyGroupId = req.familyGroupId!;

      // Get categories for the family group (includes default categories)
      const categories = await storage.getAllCategoriesByFamilyGroup(familyGroupId);

      // Add permission info (only admin can manage categories)
      const isAdmin = req.isAdmin === true;
      const categoriesWithPermissions = categories.map(cat => ({
        ...cat,
        canEdit: isAdmin,
        canDelete: isAdmin,
      }));

      res.json(categoriesWithPermissions);
    } catch (error) {
      logger.error("Error fetching categories:", error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  // Only admin can create categories
  app.post("/api/categories", authMiddleware, familyAuthMiddleware, requireFamilyGroup, requireAdmin, async (req: FamilyAuthenticatedRequest, res: Response) => {
    const userId = req.userId!;

    try {
      logger.debug("\n=== CRIANDO NOVA CATEGORIA ===");
      logger.debug("UserId:", userId);
      logger.debug("Dados recebidos:", JSON.stringify(req.body, null, 2));

      const category = await storage.createCategory({
        name: req.body.name,
        type: req.body.type,
        color: req.body.color,
        icon: req.body.icon || null,
        parentId: req.body.parentId || null,
      }, userId);

      logger.debug("Categoria criada com sucesso:", JSON.stringify(category, null, 2));
      logger.debug("=== FIM CRIAÇÃO CATEGORIA ===\n");

      res.json(category);
    } catch (error) {
      logger.error("\n=== ERRO AO CRIAR CATEGORIA ===");
      logger.error("UserId:", userId);
      logger.error("Dados enviados:", JSON.stringify(req.body, null, 2));

      if (error instanceof Error) {
        logger.error("Erro:", error.message);
        logger.error("Stack:", error.stack);
      }

      if (error && typeof error === 'object') {
        logger.error("Detalhes do erro:", JSON.stringify(error, null, 2));
      }
      logger.error("=== FIM DO ERRO ===\n");

      res.status(500).json({ error: "Failed to create category" });
    }
  });

  // Only admin can update categories
  app.patch("/api/categories/:id", authMiddleware, familyAuthMiddleware, requireFamilyGroup, requireAdmin, async (req: FamilyAuthenticatedRequest, res: Response) => {
    try {
      const category = await storage.updateCategory(req.params.id, {
        name: req.body.name,
        type: req.body.type,
        color: req.body.color,
        icon: req.body.icon,
      });
      res.json(category);
    } catch (error) {
      logger.error("Error updating category:", error);
      res.status(500).json({ error: "Failed to update category" });
    }
  });

  // Only admin can delete categories
  app.delete("/api/categories/:id", authMiddleware, familyAuthMiddleware, requireFamilyGroup, requireAdmin, async (req: FamilyAuthenticatedRequest, res: Response) => {
    try {
      await storage.deleteCategory(req.params.id);
      res.json({ success: true });
    } catch (error) {
      logger.error("Error deleting category:", error);
      res.status(500).json({ error: "Failed to delete category" });
    }
  });

}
