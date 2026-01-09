import { useMemo } from "react";
import { Card } from "@/shared/components/ui/card";
import { TransactionItem, type Transaction } from "./TransactionItem";
import { FileX } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface TransactionListProps {
  transactions: Transaction[];
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (id: string) => void;
  onToggleStatus?: (transaction: Transaction) => void;
  onAddNew?: () => void;
  showHeader?: boolean;
  showRunningBalance?: boolean;
  maxItems?: number;
}

function calculateRunningBalances(transactions: Transaction[]): Map<string, number> {
  const sorted = [...transactions].sort((a, b) => a.date.getTime() - b.date.getTime());
  let balance = 0;
  const balances = new Map<string, number>();

  for (const t of sorted) {
    balance += t.type === "income" ? t.amount : -t.amount;
    balances.set(t.id, balance);
  }
  return balances;
}

export function TransactionList({
  transactions,
  onEdit,
  onDelete,
  onToggleStatus,
  onAddNew,
  showHeader = true,
  showRunningBalance = true,
  maxItems,
}: TransactionListProps) {
  const displayTransactions = maxItems
    ? transactions.slice(0, maxItems)
    : transactions;

  const runningBalances = useMemo(() => {
    if (!showRunningBalance) return new Map<string, number>();
    return calculateRunningBalances(displayTransactions);
  }, [displayTransactions, showRunningBalance]);

  const sortedForDisplay = useMemo(() => {
    return [...displayTransactions].sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [displayTransactions]);

  if (transactions.length === 0) {
    return (
      <Card className="p-12 flex flex-col items-center justify-center min-h-96 text-center">
        <FileX className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Nenhuma transação encontrada</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Comece adicionando sua primeira transação
        </p>
        {onAddNew && (
          <Button onClick={onAddNew} data-testid="button-add-first-transaction">
            Adicionar Transação
          </Button>
        )}
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden" data-testid="list-transactions">
      {showHeader && (
        <div className="hidden md:grid grid-cols-[100px_1fr_100px_120px_120px_90px] gap-4 p-4 border-b bg-muted/50 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <div>Data</div>
          <div>Descrição</div>
          <div className="text-center">Situação</div>
          <div className="text-right">Valor (R$)</div>
          {showRunningBalance && <div className="text-right">Saldo (R$)</div>}
          <div className="text-center">Ações</div>
        </div>
      )}
      <div className="divide-y">
        {sortedForDisplay.map((transaction) => (
          <TransactionItem
            key={transaction.id}
            transaction={transaction}
            runningBalance={showRunningBalance ? runningBalances.get(transaction.id) : undefined}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleStatus={onToggleStatus}
          />
        ))}
      </div>
    </Card>
  );
}
