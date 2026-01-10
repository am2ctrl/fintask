import type { Express, Response } from "express";
import {
  authMiddleware,
  familyAuthMiddleware,
  requireAdmin,
  requireFamilyGroup,
  type FamilyAuthenticatedRequest,
} from "../auth";
import { storage } from "../../core/infrastructure/supabaseStorage";
import { logger } from "../../core/logger";
import {
  createMemberAccount,
  resetMemberPassword,
  removeMember,
} from "./memberService";

export function registerFamilyAccountRoutes(app: Express) {
  /**
   * GET /api/family-account
   * Get current user's family account info including group and members
   */
  app.get(
    "/api/family-account",
    authMiddleware,
    familyAuthMiddleware,
    async (req: FamilyAuthenticatedRequest, res: Response) => {
      try {
        const userId = req.userId!;

        // Get or create family group
        let familyGroup = await storage.getFamilyGroupByUserId(userId);

        // If no family group exists, create one automatically for the user
        if (!familyGroup) {
          familyGroup = await storage.createFamilyGroup(userId);
        }

        // Get members
        const members = await storage.getFamilyGroupMembers(familyGroup.id);

        // Find current user's member record
        const currentMember = members.find((m) => m.userId === userId);

        // Get pending deletion requests count (admin only)
        let pendingDeletionCount = 0;
        if (currentMember?.role === "admin") {
          const deletionRequests = await storage.getDeletionRequests(
            familyGroup.id,
            "pending"
          );
          pendingDeletionCount = deletionRequests.length;
        }

        res.json({
          group: familyGroup,
          members,
          currentMember,
          role: currentMember?.role || null,
          pendingDeletionCount,
        });
      } catch (error) {
        logger.error("Error fetching family account:", error);
        res.status(500).json({ error: "Erro ao buscar dados da familia" });
      }
    }
  );

  /**
   * POST /api/family-account/setup
   * Create a new family group (for users who don't have one yet)
   */
  app.post(
    "/api/family-account/setup",
    authMiddleware,
    async (req: FamilyAuthenticatedRequest, res: Response) => {
      try {
        const userId = req.userId!;
        const { name } = req.body;

        // Check if user already has a family group
        const existingGroup = await storage.getFamilyGroupByUserId(userId);
        if (existingGroup) {
          return res.status(400).json({ error: "Voce ja possui um grupo familiar" });
        }

        const familyGroup = await storage.createFamilyGroup(userId, name);
        const members = await storage.getFamilyGroupMembers(familyGroup.id);

        res.json({
          group: familyGroup,
          members,
          currentMember: members[0],
          role: "admin",
        });
      } catch (error) {
        logger.error("Error creating family group:", error);
        res.status(500).json({ error: "Erro ao criar grupo familiar" });
      }
    }
  );

  /**
   * PATCH /api/family-account
   * Update family group settings (admin only)
   */
  app.patch(
    "/api/family-account",
    authMiddleware,
    familyAuthMiddleware,
    requireFamilyGroup,
    requireAdmin,
    async (req: FamilyAuthenticatedRequest, res: Response) => {
      try {
        const { name } = req.body;
        const familyGroupId = req.familyGroupId!;

        const updatedGroup = await storage.updateFamilyGroup(familyGroupId, { name });
        if (!updatedGroup) {
          return res.status(404).json({ error: "Grupo familiar nao encontrado" });
        }

        res.json(updatedGroup);
      } catch (error) {
        logger.error("Error updating family group:", error);
        res.status(500).json({ error: "Erro ao atualizar grupo familiar" });
      }
    }
  );

  /**
   * POST /api/family-account/members
   * Add a new member to the family (admin only)
   */
  app.post(
    "/api/family-account/members",
    authMiddleware,
    familyAuthMiddleware,
    requireFamilyGroup,
    requireAdmin,
    async (req: FamilyAuthenticatedRequest, res: Response) => {
      try {
        const { email, password, displayName } = req.body;
        const familyGroupId = req.familyGroupId!;
        const adminUserId = req.userId!;

        // Validate input
        if (!email || !password || !displayName) {
          return res.status(400).json({
            error: "Email, senha e nome sao obrigatorios",
          });
        }

        if (password.length < 6) {
          return res.status(400).json({
            error: "A senha deve ter pelo menos 6 caracteres",
          });
        }

        const member = await createMemberAccount({
          email,
          password,
          displayName,
          familyGroupId,
          adminUserId,
        });

        res.json(member);
      } catch (error) {
        logger.error("Error adding family member:", error);
        const message = error instanceof Error ? error.message : "Erro ao adicionar membro";
        res.status(400).json({ error: message });
      }
    }
  );

  /**
   * DELETE /api/family-account/members/:id
   * Remove a member from the family (admin only)
   */
  app.delete(
    "/api/family-account/members/:id",
    authMiddleware,
    familyAuthMiddleware,
    requireFamilyGroup,
    requireAdmin,
    async (req: FamilyAuthenticatedRequest, res: Response) => {
      try {
        const memberId = req.params.id;
        const adminUserId = req.userId!;

        await removeMember(memberId, adminUserId);

        res.json({ success: true });
      } catch (error) {
        logger.error("Error removing family member:", error);
        const message = error instanceof Error ? error.message : "Erro ao remover membro";
        res.status(400).json({ error: message });
      }
    }
  );

  /**
   * POST /api/family-account/members/:id/reset-password
   * Reset a member's password (admin only)
   */
  app.post(
    "/api/family-account/members/:id/reset-password",
    authMiddleware,
    familyAuthMiddleware,
    requireFamilyGroup,
    requireAdmin,
    async (req: FamilyAuthenticatedRequest, res: Response) => {
      try {
        const memberId = req.params.id;
        const { newPassword } = req.body;
        const adminUserId = req.userId!;

        if (!newPassword || newPassword.length < 6) {
          return res.status(400).json({
            error: "A nova senha deve ter pelo menos 6 caracteres",
          });
        }

        await resetMemberPassword({
          memberId,
          newPassword,
          adminUserId,
        });

        res.json({ success: true });
      } catch (error) {
        logger.error("Error resetting member password:", error);
        const message = error instanceof Error ? error.message : "Erro ao redefinir senha";
        res.status(400).json({ error: message });
      }
    }
  );

  // ============================================
  // Deletion Requests Routes
  // ============================================

  /**
   * GET /api/family-account/deletion-requests
   * Get all deletion requests for the family (admin sees all, members see their own)
   */
  app.get(
    "/api/family-account/deletion-requests",
    authMiddleware,
    familyAuthMiddleware,
    requireFamilyGroup,
    async (req: FamilyAuthenticatedRequest, res: Response) => {
      try {
        const familyGroupId = req.familyGroupId!;
        const status = req.query.status as string | undefined;

        const deletionRequests = await storage.getDeletionRequests(
          familyGroupId,
          status as any
        );

        // If not admin, filter to only show user's own requests
        const filtered = req.isAdmin
          ? deletionRequests
          : deletionRequests.filter((r) => r.requestedByUserId === req.userId);

        res.json(filtered);
      } catch (error) {
        logger.error("Error fetching deletion requests:", error);
        res.status(500).json({ error: "Erro ao buscar solicitacoes de exclusao" });
      }
    }
  );

  /**
   * POST /api/family-account/deletion-requests
   * Create a deletion request (for non-admin members)
   */
  app.post(
    "/api/family-account/deletion-requests",
    authMiddleware,
    familyAuthMiddleware,
    requireFamilyGroup,
    async (req: FamilyAuthenticatedRequest, res: Response) => {
      try {
        const { resourceType, resourceId, reason } = req.body;
        const familyGroupId = req.familyGroupId!;
        const userId = req.userId!;

        // Validate resource type
        if (!["transaction", "credit_card"].includes(resourceType)) {
          return res.status(400).json({ error: "Tipo de recurso invalido" });
        }

        // Verify the resource exists and belongs to this family
        let resource;
        if (resourceType === "transaction") {
          resource = await storage.getTransactionWithOwnership(resourceId);
        } else {
          resource = await storage.getCreditCardWithOwnership(resourceId);
        }

        if (!resource || resource.familyGroupId !== familyGroupId) {
          return res.status(404).json({ error: "Recurso nao encontrado" });
        }

        // If admin, just delete directly
        if (req.isAdmin) {
          if (resourceType === "transaction") {
            await storage.deleteTransaction(resourceId);
          } else {
            await storage.deleteCreditCard(resourceId);
          }
          return res.json({ success: true, directDelete: true });
        }

        // Create deletion request
        const deletionRequest = await storage.createDeletionRequest({
          familyGroupId,
          resourceType,
          resourceId,
          requestedByUserId: userId,
          reason,
        });

        res.json(deletionRequest);
      } catch (error) {
        logger.error("Error creating deletion request:", error);
        res.status(500).json({ error: "Erro ao solicitar exclusao" });
      }
    }
  );

  /**
   * PATCH /api/family-account/deletion-requests/:id
   * Approve or reject a deletion request (admin only)
   */
  app.patch(
    "/api/family-account/deletion-requests/:id",
    authMiddleware,
    familyAuthMiddleware,
    requireFamilyGroup,
    requireAdmin,
    async (req: FamilyAuthenticatedRequest, res: Response) => {
      try {
        const requestId = req.params.id;
        const { status } = req.body;
        const adminUserId = req.userId!;

        if (!["approved", "rejected"].includes(status)) {
          return res.status(400).json({ error: "Status invalido" });
        }

        // Verify the request belongs to this family
        const existingRequest = await storage.getDeletionRequestById(requestId);
        if (!existingRequest || existingRequest.familyGroupId !== req.familyGroupId) {
          return res.status(404).json({ error: "Solicitacao nao encontrada" });
        }

        if (existingRequest.status !== "pending") {
          return res.status(400).json({ error: "Esta solicitacao ja foi processada" });
        }

        const updatedRequest = await storage.updateDeletionRequest(
          requestId,
          status,
          adminUserId
        );

        res.json(updatedRequest);
      } catch (error) {
        logger.error("Error updating deletion request:", error);
        res.status(500).json({ error: "Erro ao processar solicitacao" });
      }
    }
  );
}
