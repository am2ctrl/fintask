/**
 * Utilitários para conversão de case (camelCase ↔ snake_case)
 */

/**
 * Converte string de camelCase para snake_case
 *
 * @param str - String em camelCase
 * @returns String em snake_case
 * @example
 * toSnakeCase("userId") // => "user_id"
 * toSnakeCase("categoryId") // => "category_id"
 */
export function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/**
 * Converte string de snake_case para camelCase
 *
 * @param str - String em snake_case
 * @returns String em camelCase
 * @example
 * toCamelCase("user_id") // => "userId"
 * toCamelCase("category_id") // => "categoryId"
 */
export function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Converte objeto de camelCase para snake_case (shallow)
 *
 * @param obj - Objeto com chaves em camelCase
 * @returns Novo objeto com chaves em snake_case
 * @example
 * objectToSnakeCase({ userId: "123", categoryId: "456" })
 * // => { user_id: "123", category_id: "456" }
 */
export function objectToSnakeCase<T extends Record<string, any>>(
  obj: T
): Record<string, any> {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    acc[toSnakeCase(key)] = value;
    return acc;
  }, {} as Record<string, any>);
}

/**
 * Converte objeto de snake_case para camelCase (shallow)
 *
 * @param obj - Objeto com chaves em snake_case
 * @returns Novo objeto com chaves em camelCase
 * @example
 * objectToCamelCase({ user_id: "123", category_id: "456" })
 * // => { userId: "123", categoryId: "456" }
 */
export function objectToCamelCase<T extends Record<string, any>>(
  obj: T
): Record<string, any> {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    acc[toCamelCase(key)] = value;
    return acc;
  }, {} as Record<string, any>);
}
