import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryBadge, type Category } from "./CategoryBadge";
import { formatCurrency } from "./SummaryCard";

export interface Transaction {
  id: string;
  date: Date;
  amount: number;
  type: "income" | "expense";
  category: Category;
  description: string;
}

interface TransactionItemProps {
  transaction: Transaction;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (id: string) => void;
}

export function TransactionItem({ transaction, onEdit, onDelete }: TransactionItemProps) {
  return (
    <div
      className="group flex items-center justify-between gap-4 p-4 hover-elevate active-elevate-2 rounded-md"
      data-testid={`row-transaction-${transaction.id}`}
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="text-sm text-muted-foreground w-20 shrink-0">
          {format(transaction.date, "dd/MM/yyyy", { locale: ptBR })}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{transaction.description}</p>
        </div>
        <CategoryBadge category={transaction.category} size="sm" />
      </div>
      <div className="flex items-center gap-2">
        <span
          className={`font-mono text-sm font-semibold ${
            transaction.type === "income" ? "text-primary" : "text-destructive"
          }`}
        >
          {transaction.type === "income" ? "+" : "-"}
          {formatCurrency(transaction.amount)}
        </span>
        <div className="flex items-center gap-1 invisible group-hover:visible">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit?.(transaction)}
            data-testid={`button-edit-${transaction.id}`}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete?.(transaction.id)}
            data-testid={`button-delete-${transaction.id}`}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>
    </div>
  );
}
