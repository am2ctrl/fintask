import type { FamilyAuthenticatedRequest } from "./familyAuth.middleware";

export type ResourceType = 'transaction' | 'credit_card' | 'category' | 'family_member';
export type Action = 'create' | 'read' | 'update' | 'delete';

export interface PermissionCheck {
  allowed: boolean;
  requiresApproval?: boolean;
  message?: string;
}

/**
 * Check if the current user has permission to perform an action on a resource.
 *
 * @param req - The authenticated request with family info
 * @param resourceType - Type of resource being accessed
 * @param action - Action being performed
 * @param resourceOwnerId - User ID who created the resource (for ownership checks)
 * @returns PermissionCheck object indicating if action is allowed
 */
export function checkPermission(
  req: FamilyAuthenticatedRequest,
  resourceType: ResourceType,
  action: Action,
  resourceOwnerId?: string | null
): PermissionCheck {
  const { userId, isAdmin } = req;

  // Admins can do everything
  if (isAdmin) {
    return { allowed: true };
  }

  // Member permissions
  switch (resourceType) {
    case 'transaction':
      if (action === 'create') {
        return { allowed: true };
      }
      if (action === 'read') {
        return { allowed: true };
      }
      if (action === 'update') {
        const isOwner = resourceOwnerId === userId;
        return {
          allowed: isOwner,
          message: isOwner ? undefined : "Voce so pode editar transacoes que voce criou"
        };
      }
      if (action === 'delete') {
        return {
          allowed: false,
          requiresApproval: true,
          message: "Exclusao de transacoes requer aprovacao do administrador"
        };
      }
      break;

    case 'credit_card':
      if (action === 'create') {
        return { allowed: true };
      }
      if (action === 'read') {
        return { allowed: true };
      }
      if (action === 'update') {
        const isOwner = resourceOwnerId === userId;
        return {
          allowed: isOwner,
          message: isOwner ? undefined : "Voce so pode editar cartoes que voce criou"
        };
      }
      if (action === 'delete') {
        return {
          allowed: false,
          requiresApproval: true,
          message: "Exclusao de cartoes requer aprovacao do administrador"
        };
      }
      break;

    case 'category':
      if (action === 'read') {
        return { allowed: true };
      }
      return {
        allowed: false,
        message: "Apenas o administrador pode gerenciar categorias"
      };

    case 'family_member':
      if (action === 'read') {
        return { allowed: true };
      }
      return {
        allowed: false,
        message: "Apenas o administrador pode gerenciar membros da familia"
      };
  }

  return { allowed: false, message: "Acao nao permitida" };
}

/**
 * Check if user can edit a specific resource based on ownership
 */
export function canEdit(
  req: FamilyAuthenticatedRequest,
  resourceType: ResourceType,
  resourceOwnerId?: string | null
): boolean {
  return checkPermission(req, resourceType, 'update', resourceOwnerId).allowed;
}

/**
 * Check if user can delete a specific resource (admins only can delete directly)
 */
export function canDelete(req: FamilyAuthenticatedRequest): boolean {
  return req.isAdmin === true;
}

/**
 * Check if user needs to request approval for deletion
 */
export function needsDeletionApproval(req: FamilyAuthenticatedRequest): boolean {
  return !req.isAdmin;
}
