/**
 * Utilitários para manipulação de valores monetários brasileiros
 */

/**
 * Converte string monetária brasileira para number
 * @param amountStr - "1.234,56" ou "1234,56"
 * @returns 1234.56
 * @example
 * parseAmount("1.234,56") // => 1234.56
 * parseAmount("1234,56") // => 1234.56
 */
export function parseAmount(amountStr: string): number {
  const cleaned = amountStr.replace(/\./g, '').replace(',', '.');
  return parseFloat(cleaned);
}

/**
 * Formata número como moeda brasileira
 * @param amount - 1234.56
 * @returns "R$ 1.234,56"
 * @example
 * formatCurrency(1234.56) // => "R$ 1.234,56"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(amount);
}

/**
 * Formata número sem símbolo de moeda
 * @param amount - 1234.56
 * @returns "1.234,56"
 * @example
 * formatNumber(1234.56) // => "1.234,56"
 */
export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}
