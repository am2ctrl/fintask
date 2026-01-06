import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card } from "@/shared/components/ui/card";
import { TransactionItem, type Transaction } from "./TransactionItem";
import { FileX } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface TransactionListProps {
  transactions: Transaction[];
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (id: string) => void;
  onAddNew?: () => void;
  showHeader?: boolean;
  maxItems?: number;
}

function groupByMonth(transactions: Transaction[]): Map<string, Transaction[]> {
  const groups = new Map<string, Transaction[]>();
  
  transactions.forEach((transaction) => {
    const monthKey = format(transaction.date, "MMMM yyyy", { locale: ptBR });
    const existing = groups.get(monthKey) || [];
    groups.set(monthKey, [...existing, transaction]);
  });

  return groups;
}

export function TransactionList({
  transactions,
  onEdit,
  onDelete,
  onAddNew,
  showHeader = true,
  maxItems,
}: TransactionListProps) {
  const displayTransactions = maxItems 
    ? transactions.slice(0, maxItems) 
    : transactions;

  const grouped = groupByMonth(displayTransactions);

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
        <div className="p-4 border-b flex items-center justify-between gap-4 bg-muted/30">
          <h3 className="font-semibold">Transações Recentes</h3>
        </div>
      )}
      <div className="divide-y">
        {Array.from(grouped.entries()).map(([month, items]) => (
          <div key={month}>
            <div className="sticky top-0 z-50 px-4 py-2 bg-muted/50 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {month}
            </div>
            <div className="divide-y">
              {items.map((transaction) => (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
