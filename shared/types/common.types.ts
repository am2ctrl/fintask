/**
 * Tipos comuns compartilhados
 */

export type UUID = string;
export type DateString = string; // ISO 8601 format
export type BrazilianDateString = string; // DD/MM/YYYY or DD/MM

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface SuccessResponse<T = void> {
  success: true;
  data: T;
}

export interface ErrorResponse {
  success: false;
  error: string;
  details?: Record<string, any>;
}
