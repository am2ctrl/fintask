import type { Express } from "express";
import type { Server } from "http";
import { registerAuthRoutes } from './features/auth';
import { registerTransactionRoutes } from './features/transactions';
import { registerCategoryRoutes } from './features/categories';
import { registerCardRoutes } from './features/cards';
import { registerFamilyRoutes } from './features/family';
import { registerImportRoutes } from './features/import';
import { registerDashboardRoutes } from './features/dashboard';

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Register all feature routes
  registerAuthRoutes(app);
  registerTransactionRoutes(app);
  registerCategoryRoutes(app);
  registerCardRoutes(app);
  registerFamilyRoutes(app);
  registerImportRoutes(app);
  registerDashboardRoutes(app);

  return httpServer;
}
