import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { logger } from '../logger';

export type ValidateLocation = 'body' | 'params' | 'query';

/**
 * Middleware para validar request usando Zod schemas
 */
export function validate(schema: ZodSchema, location: ValidateLocation = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req[location];
      const validated = schema.parse(data);

      // Substituir req[location] com dados validados
      req[location] = validated;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);

        logger.warn('Validation error:', {
          path: req.path,
          location,
          errors: error.errors,
        });

        return res.status(400).json({
          error: 'Validation failed',
          message: validationError.message,
          issues: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        });
      }

      next(error);
    }
  };
}
