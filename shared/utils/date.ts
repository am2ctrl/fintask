/**
 * Utilitários para manipulação de datas
 */

/**
 * Converte data brasileira curta (DD/MM) para ISO
 * Assume ano atual, ou ano anterior se o mês for maior que o atual
 *
 * @param dateStr - "25/12"
 * @returns "2024-12-25" (ou "2023-12-25" se mês for futuro)
 * @example
 * // Se estamos em janeiro de 2024:
 * parseBrazilianShortDate("25/12") // => "2023-12-25"
 * parseBrazilianShortDate("15/01") // => "2024-01-15"
 */
export function parseBrazilianShortDate(dateStr: string): string {
  const [day, month] = dateStr.split('/');
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  // Se o mês é maior que o atual, assumir ano anterior
  const year = parseInt(month) > currentMonth ? currentYear - 1 : currentYear;

  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

/**
 * Normaliza diferentes formatos de data para ISO
 *
 * @param dateStr - "2024-12-25", "25/12/2024", ou "25/12"
 * @returns "2024-12-25"
 * @throws Error se formato não for suportado
 * @example
 * normalizeDate("2024-12-25") // => "2024-12-25"
 * normalizeDate("25/12/2024") // => "2024-12-25"
 * normalizeDate("25/12") // => "2024-12-25" (ou 2023 se mês futuro)
 */
export function normalizeDate(dateStr: string): string {
  // Já está em formato ISO
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }

  // Formato brasileiro completo: DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  // Formato brasileiro curto: DD/MM
  if (/^\d{2}\/\d{2}$/.test(dateStr)) {
    return parseBrazilianShortDate(dateStr);
  }

  throw new Error(`Formato de data não suportado: ${dateStr}`);
}

/**
 * Formata data ISO para brasileiro
 *
 * @param isoDate - "2024-12-25"
 * @returns "25/12/2024"
 * @example
 * formatBrazilianDate("2024-12-25") // => "25/12/2024"
 */
export function formatBrazilianDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}
