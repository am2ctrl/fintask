import { addMonths, setDate, format } from 'date-fns';
import type { InsertTransaction } from '../core/infrastructure/supabaseStorage';

/**
 * Converte string YYYY-MM-DD para Date de forma segura (meio-dia local)
 */
function parseDate(date: Date | string): Date {
  if (typeof date === 'string') {
    return new Date(date + 'T12:00:00');
  }
  return date;
}

/**
 * Converte Date para string YYYY-MM-DD
 */
function formatDate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Gera transações recorrentes mensais
 * @param baseTransaction - Transação base para replicar
 * @param months - Número de meses para gerar (null = não gera, apenas retorna a base)
 * @returns Array de transações a serem criadas
 */
export function generateRecurringTransactions(
  baseTransaction: InsertTransaction,
  months: number | null
): InsertTransaction[] {
  // Se não for recorrente ou não tiver meses definidos, retorna apenas a transação base
  if (!baseTransaction.isRecurring || !months || months <= 0) {
    return [baseTransaction];
  }

  const transactions: InsertTransaction[] = [];
  const baseDate = parseDate(baseTransaction.date);
  const baseDueDate = baseTransaction.dueDate ? parseDate(baseTransaction.dueDate) : null;

  // Adiciona a transação base
  transactions.push({ ...baseTransaction });

  // Gera as próximas transações recorrentes
  for (let i = 1; i < months; i++) {
    const nextDate = addMonths(baseDate, i);
    const nextDueDate = baseDueDate ? addMonths(baseDueDate, i) : null;

    transactions.push({
      ...baseTransaction,
      date: formatDate(nextDate),
      dueDate: nextDueDate ? formatDate(nextDueDate) : null,
      isPaid: false, // Transações futuras não estão pagas
    });
  }

  return transactions;
}

/**
 * Gera transações parceladas
 * @param baseTransaction - Transação base (primeira parcela)
 * @returns Array de transações (todas as parcelas)
 */
export function generateInstallmentTransactions(
  baseTransaction: InsertTransaction
): InsertTransaction[] {
  // Se não for parcelada ou não tiver dados de parcelamento, retorna apenas a base
  if (
    baseTransaction.mode !== 'parcelada' ||
    !baseTransaction.installmentsTotal ||
    baseTransaction.installmentsTotal <= 1
  ) {
    return [baseTransaction];
  }

  const transactions: InsertTransaction[] = [];
  const totalInstallments = baseTransaction.installmentsTotal;
  const startInstallment = baseTransaction.installmentNumber || 1;
  const baseDate = parseDate(baseTransaction.date);
  const baseDueDate = baseTransaction.dueDate ? parseDate(baseTransaction.dueDate) : null;

  // Gera todas as parcelas a partir da atual
  for (let i = startInstallment; i <= totalInstallments; i++) {
    const monthsAhead = i - startInstallment;
    const installmentDate = addMonths(baseDate, monthsAhead);
    const installmentDueDate = baseDueDate ? addMonths(baseDueDate, monthsAhead) : null;

    transactions.push({
      ...baseTransaction,
      date: formatDate(installmentDate),
      dueDate: installmentDueDate ? formatDate(installmentDueDate) : null,
      installmentNumber: i,
      // Primeira parcela mantém o isPaid do usuário, as demais são não pagas
      isPaid: i === startInstallment ? (baseTransaction.isPaid || false) : false,
    });
  }

  return transactions;
}

/**
 * Processa uma transação e gera todas as transações derivadas
 * (recorrentes OU parceladas, nunca ambos)
 * @param transaction - Transação a ser processada
 * @returns Array de todas as transações a serem criadas
 */
export function processTransaction(transaction: InsertTransaction): InsertTransaction[] {
  // Prioridade: Parceladas > Recorrentes > Simples

  // 1. Se for parcelada, gera todas as parcelas
  if (transaction.mode === 'parcelada' && transaction.installmentsTotal && transaction.installmentsTotal > 1) {
    return generateInstallmentTransactions(transaction);
  }

  // 2. Se for recorrente, gera os meses recorrentes
  if (transaction.isRecurring && transaction.recurringMonths) {
    return generateRecurringTransactions(transaction, transaction.recurringMonths);
  }

  // 3. Caso contrário, retorna apenas a transação original
  return [transaction];
}
