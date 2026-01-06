/**
 * Utilitários para validação de dados
 */

/**
 * Regex para validar UUID v4
 */
export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Valida se string é UUID válido
 *
 * @param value - String a ser validada
 * @returns true se for UUID válido
 * @example
 * validateUUID("550e8400-e29b-41d4-a716-446655440000") // => true
 * validateUUID("invalid") // => false
 */
export function validateUUID(value: string): boolean {
  return UUID_REGEX.test(value);
}

/**
 * Valida se string é UUID válido e lança erro se não for
 *
 * @param value - String a ser validada
 * @param fieldName - Nome do campo para mensagem de erro
 * @throws Error se não for UUID válido
 * @example
 * assertUUID("550e8400-e29b-41d4-a716-446655440000", "userId") // OK
 * assertUUID("invalid", "userId") // throws Error
 */
export function assertUUID(value: string, fieldName: string = 'ID'): asserts value is string {
  if (!validateUUID(value)) {
    throw new Error(`${fieldName} inválido: ${value} não é um UUID válido`);
  }
}

/**
 * Valida montante (deve ser positivo)
 *
 * @param amount - Número a ser validado
 * @returns true se for número positivo válido
 * @example
 * validateAmount(123.45) // => true
 * validateAmount(-10) // => false
 * validateAmount(NaN) // => false
 */
export function validateAmount(amount: number): boolean {
  return !isNaN(amount) && amount > 0;
}

/**
 * Valida data no formato ISO (YYYY-MM-DD)
 *
 * @param dateStr - String de data a ser validada
 * @returns true se for data ISO válida
 * @example
 * validateISODate("2024-12-25") // => true
 * validateISODate("25/12/2024") // => false
 * validateISODate("2024-13-01") // => false (mês inválido)
 */
export function validateISODate(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return false;
  }
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}
