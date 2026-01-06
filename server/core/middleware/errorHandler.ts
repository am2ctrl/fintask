import { Request, Response, NextFunction } from 'express';
import { logger } from '../logger';

/**
 * Erro customizado da aplicação
 */
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Middleware global de tratamento de erros
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // AppError customizado
  if (err instanceof AppError) {
    logger.error('Application Error', {
      message: err.message,
      statusCode: err.statusCode,
      context: err.context,
      path: req.path,
      method: req.method,
      userId: (req as any).userId,
    });

    return res.status(err.statusCode).json({
      error: err.message,
      ...(err.context && { details: err.context })
    });
  }

  // Erro desconhecido
  logger.error('Unknown Error', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(500).json({
    error: 'Erro interno do servidor'
  });
};

/**
 * Wrapper para funções async que captura erros automaticamente
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Erros pré-definidos comuns
 */
export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(
      `${resource} não encontrado${id ? `: ${id}` : ''}`,
      404
    );
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 400, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Não autorizado') {
    super(message, 401);
  }
}
