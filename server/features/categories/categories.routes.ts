import type { Express, Response } from "express";
import { authMiddleware, type AuthenticatedRequest } from '../auth';
import { storage } from '../../core/infrastructure/supabaseStorage';
import { validateUUID } from '../../../shared/utils/validation';
import { logger } from '../../core/logger';

export function registerCategoryRoutes(app: Express) {
  app.get("/api/categories", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.userId!;
      const categories = await storage.getAllCategories(userId);
      res.json(categories);
    } catch (error) {
      logger.error("Error fetching categories:", error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
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
      logger.error("Error updating category:", error);
      res.status(500).json({ error: "Failed to update category" });
    }
  });

  app.delete("/api/categories/:id", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      await storage.deleteCategory(req.params.id);
      res.json({ success: true });
    } catch (error) {
      logger.error("Error deleting category:", error);
      res.status(500).json({ error: "Failed to delete category" });
    }
  });

}
