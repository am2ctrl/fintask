import { useMemo } from "react";
import type { Transaction } from "@/features/transactions/components/TransactionItem";

export interface TransactionSummary {
  saldoReal: number;
  aReceber: number;
  aPagar: number;
  saldoPrevisto: number;
}

export interface DualRunningBalances {
  saldoReal: Map<string, number>;
  saldoPrevisto: Map<string, number>;
}

export interface UseTransactionCalculationsReturn {
  summary: TransactionSummary;
  runningBalances: DualRunningBalances;
}

function calculateSummary(transactions: Transaction[]): TransactionSummary {
  let receitasPagas = 0;
  let despesasPagas = 0;
  let receitasPendentes = 0;
  let despesasPendentes = 0;

  for (const t of transactions) {
    if (t.type === "income") {
      if (t.isPaid) {
        receitasPagas += t.amount;
      } else {
        receitasPendentes += t.amount;
      }
    } else {
      if (t.isPaid) {
        despesasPagas += t.amount;
      } else {
        despesasPendentes += t.amount;
      }
    }
  }

  const saldoReal = receitasPagas - despesasPagas;
  const aReceber = receitasPendentes;
  const aPagar = despesasPendentes;
  const saldoPrevisto = saldoReal + aReceber - aPagar;

  return { saldoReal, aReceber, aPagar, saldoPrevisto };
}

function calculateDualRunningBalances(transactions: Transaction[]): DualRunningBalances {
  const sorted = [...transactions].sort((a, b) => a.date.getTime() - b.date.getTime());

  let balanceReal = 0;
  let balancePrevisto = 0;

  const saldoReal = new Map<string, number>();
  const saldoPrevisto = new Map<string, number>();

  for (const t of sorted) {
    const amount = t.type === "income" ? t.amount : -t.amount;

    // Saldo Previsto: acumula TODAS as transacoes
    balancePrevisto += amount;
    saldoPrevisto.set(t.id, balancePrevisto);

    // Saldo Real: so acumula transacoes PAGAS
    if (t.isPaid) {
      balanceReal += amount;
    }
    saldoReal.set(t.id, balanceReal);
  }

  return { saldoReal, saldoPrevisto };
}

export function useTransactionCalculations(transactions: Transaction[]): UseTransactionCalculationsReturn {
  const summary = useMemo(() => calculateSummary(transactions), [transactions]);
  const runningBalances = useMemo(() => calculateDualRunningBalances(transactions), [transactions]);

  return { summary, runningBalances };
}
