import type { Request, Response, NextFunction } from "express";
import { verifySupabaseToken } from "../../core/infrastructure/supabase";

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid authorization header" });
  }

  const token = authHeader.substring(7);
  const userId = await verifySupabaseToken(token);

  if (!userId) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  req.userId = userId;
  next();
}

export function optionalAuthMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    verifySupabaseToken(token).then((userId: string | null) => {
      if (userId) {
        req.userId = userId;
      }
      next();
    }).catch(() => {
      next();
    });
  } else {
    next();
  }
}
