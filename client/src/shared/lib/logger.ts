/**
 * Logger wrapper que só mostra logs em desenvolvimento
 * Evita console.log em produção
 */

const isDevelopment = import.meta.env.DEV;

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  error: (...args: any[]) => {
    // Erros sempre aparecem, mesmo em produção
    console.error(...args);
  },

  warn: (...args: any[]) => {
    // Warnings sempre aparecem, mesmo em produção
    console.warn(...args);
  },

  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },

  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },
};
