import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { BalanceRow } from "./BalanceRow";
import { FileX, Plus } from "lucide-react";
import type { Transaction } from "@/features/transactions/components/TransactionItem";

interface BalanceTableProps {
  payments: Transaction[];
  onSelectPayment: (payment: Transaction) => void;
  onToggleStatus: (payment: Transaction) => void;
  onEdit: (payment: Transaction) => void;
  onDelete: (id: string) => void;
  onAddNew?: () => void;
}

export function BalanceTable({ payments, onSelectPayment, onToggleStatus, onEdit, onDelete, onAddNew }: BalanceTableProps) {
  if (payments.length === 0) {
    return (
      <Card className="p-12 flex flex-col items-center justify-center min-h-64 text-center">
        <FileX className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Nenhuma transacao encontrada</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Nenhuma conta encontrada para este periodo
        </p>
        {onAddNew && (
          <Button onClick={onAddNew} data-testid="button-add-first-balance">
            <Plus className="h-4 w-4 mr-2" />
            Cadastrar Conta
          </Button>
        )}
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="hidden md:grid grid-cols-[100px_100px_1fr_80px_120px_120px_100px_90px] gap-4 p-4 border-b bg-muted/50 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <div>Vencimento</div>
        <div>Pagamento</div>
        <div>Descricao</div>
        <div className="text-center">Tipo</div>
        <div className="text-right">Total (R$)</div>
        <div className="text-right">A pagar</div>
        <div className="text-center">Situacao</div>
        <div className="text-center">Acoes</div>
      </div>

      <div className="divide-y">
        {payments.map((payment) => (
          <BalanceRow
            key={payment.id}
            payment={payment}
            onClick={() => onSelectPayment(payment)}
            onToggleStatus={() => onToggleStatus(payment)}
            onEdit={() => onEdit(payment)}
            onDelete={() => onDelete(payment.id)}
          />
        ))}
      </div>
    </Card>
  );
}
