/**
 * Utilitários de formatação
 */

/**
 * Formata número como moeda brasileira (BRL)
 * @param value - Valor numérico
 * @returns String formatada (ex: "R$ 1.234,56")
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

/**
 * Formata data no padrão brasileiro
 * @param date - String de data ISO ou Date object
 * @returns String formatada (ex: "25/12/2024")
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("pt-BR");
}

/**
 * Formata data e hora no padrão brasileiro
 * @param date - String de data ISO ou Date object
 * @returns String formatada (ex: "25/12/2024 às 14:30")
 */
export function formatDateTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("pt-BR") + " às " + d.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Formata número de cartão (últimos 4 dígitos)
 * @param digits - Últimos 4 dígitos
 * @returns String formatada (ex: "**** 1234")
 */
export function formatCardNumber(digits: string): string {
  return `**** ${digits}`;
}

/**
 * Formata percentual
 * @param value - Valor decimal (ex: 0.15 = 15%)
 * @param decimals - Casas decimais (padrão: 1)
 * @returns String formatada (ex: "15,0%")
 */
export function formatPercentage(value: number, decimals = 1): string {
  return (value * 100).toFixed(decimals).replace(".", ",") + "%";
}
