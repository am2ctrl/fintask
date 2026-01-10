import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "./auth.middleware";
import { supabase, type FamilyRole } from "../../core/infrastructure/supabase";

export interface FamilyAuthenticatedRequest extends AuthenticatedRequest {
  familyGroupId?: string;
  familyRole?: FamilyRole;
  isAdmin?: boolean;
}

/**
 * Middleware that enriches the request with family group information.
 * Must be used AFTER authMiddleware.
 */
export async function familyAuthMiddleware(
  req: FamilyAuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    // Get user's family group membership
    const { data: membership, error } = await supabase
      .from("family_group_members")
      .select("family_group_id, role")
      .eq("user_id", req.userId)
      .single();

    if (error || !membership) {
      // User might be a new admin without a family group yet
      // Check if they own a family group
      const { data: ownedGroup } = await supabase
        .from("family_groups")
        .select("id")
        .eq("admin_user_id", req.userId)
        .single();

      if (ownedGroup) {
        req.familyGroupId = ownedGroup.id;
        req.familyRole = 'admin';
        req.isAdmin = true;
      }
      // If no membership and no owned group, user needs to create one
      return next();
    }

    req.familyGroupId = membership.family_group_id;
    req.familyRole = membership.role as FamilyRole;
    req.isAdmin = membership.role === 'admin';

    next();
  } catch (error) {
    console.error("Error in familyAuthMiddleware:", error);
    return res.status(500).json({ error: "Failed to verify family membership" });
  }
}

/**
 * Middleware that requires admin role to proceed.
 * Must be used AFTER familyAuthMiddleware.
 */
export function requireAdmin(
  req: FamilyAuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.isAdmin) {
    return res.status(403).json({ error: "Acesso restrito ao administrador" });
  }
  next();
}

/**
 * Middleware that requires user to be part of a family group.
 * Must be used AFTER familyAuthMiddleware.
 */
export function requireFamilyGroup(
  req: FamilyAuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.familyGroupId) {
    return res.status(403).json({ error: "Voce precisa criar ou fazer parte de um grupo familiar" });
  }
  next();
}
