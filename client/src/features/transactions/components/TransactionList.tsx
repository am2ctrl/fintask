import { useMemo } from "react";
import { Link } from "wouter";
import { Card } from "@/shared/components/ui/card";
import { TransactionItem, type Transaction } from "./TransactionItem";
import { FileX, ArrowRight } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import type { DualRunningBalances } from "@/shared/hooks/useTransactionCalculations";

interface TransactionListProps {
  transactions: Transaction[];
  onToggleStatus?: (transaction: Transaction) => void;
  showHeader?: boolean;
  showRunningBalance?: boolean;
  runningBalances?: DualRunningBalances;
  maxItems?: number;
}

export function TransactionList({
  transactions,
  onToggleStatus,
  showHeader = true,
  showRunningBalance = true,
  runningBalances,
  maxItems,
}: TransactionListProps) {
  const displayTransactions = maxItems
    ? transactions.slice(0, maxItems)
    : transactions;

  const sortedForDisplay = useMemo(() => {
    return [...displayTransactions].sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [displayTransactions]);

  if (transactions.length === 0) {
    return (
      <Card className="p-12 flex flex-col items-center justify-center min-h-96 text-center">
        <FileX className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Nenhuma transacao encontrada</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Cadastre suas contas na secao de Pagamentos
        </p>
        <Link href="/pagamentos">
          <Button data-testid="button-go-to-payments">
            Ir para Pagamentos
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden" data-testid="list-transactions">
      {showHeader && (
        <div className={`hidden md:grid gap-4 p-4 border-b bg-muted/50 text-xs font-medium uppercase tracking-wide text-muted-foreground ${
          showRunningBalance
            ? "grid-cols-[100px_1fr_100px_120px_120px_120px_90px]"
            : "grid-cols-[100px_1fr_100px_120px_90px]"
        }`}>
          <div>Data</div>
          <div>Descricao</div>
          <div className="text-center">Situacao</div>
          <div className="text-right">Valor (R$)</div>
          {showRunningBalance && (
            <>
              <div className="text-right">Saldo Real</div>
              <div className="text-right">Saldo Previsto</div>
            </>
          )}
          <div className="text-center">Acoes</div>
        </div>
      )}
      <div className="divide-y">
        {sortedForDisplay.map((transaction) => (
          <TransactionItem
            key={transaction.id}
            transaction={transaction}
            runningBalanceReal={showRunningBalance ? runningBalances?.saldoReal.get(transaction.id) : undefined}
            runningBalancePrevisto={showRunningBalance ? runningBalances?.saldoPrevisto.get(transaction.id) : undefined}
            showDualBalance={showRunningBalance}
            onToggleStatus={onToggleStatus}
          />
        ))}
      </div>
    </Card>
  );
}
