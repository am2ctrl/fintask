/**
 * Logger wrapper para o backend
 * Em produção, pode ser integrado com serviços como Winston, Pino, etc.
 */

const isDevelopment = process.env.NODE_ENV !== "production";

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  error: (...args: any[]) => {
    // Erros sempre mostram, mas em produção poderia enviar para Sentry/etc
    console.error(...args);
  },

  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },

  info: (...args: any[]) => {
    console.info(...args);
  },

  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },

  /**
   * Log de requisição HTTP (útil para debugging)
   */
  request: (method: string, path: string, userId?: string) => {
    if (isDevelopment) {
      const userInfo = userId ? ` [User: ${userId}]` : "";
      console.log(`[${method}] ${path}${userInfo}`);
    }
  },
};
