import { Card } from "@/shared/components/ui/card";
import { PaymentRow } from "./PaymentRow";
import type { Transaction } from "@/features/transactions/components/TransactionItem";

interface PaymentTableProps {
  payments: Transaction[];
  onSelectPayment: (payment: Transaction) => void;
  onToggleStatus: (payment: Transaction) => void;
}

export function PaymentTable({ payments, onSelectPayment, onToggleStatus }: PaymentTableProps) {
  if (payments.length === 0) {
    return (
      <Card className="p-12 flex flex-col items-center justify-center text-center">
        <p className="text-muted-foreground">Nenhum pagamento encontrado para este período</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="hidden md:grid grid-cols-[100px_100px_1fr_120px_120px_100px_90px] gap-4 p-4 border-b bg-muted/50 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <div>Vencimento</div>
        <div>Pagamento</div>
        <div>Descrição</div>
        <div className="text-right">Total (R$)</div>
        <div className="text-right">A pagar</div>
        <div className="text-center">Situação</div>
        <div className="text-center">Ações</div>
      </div>

      <div className="divide-y">
        {payments.map((payment) => (
          <PaymentRow
            key={payment.id}
            payment={payment}
            onClick={() => onSelectPayment(payment)}
            onToggleStatus={() => onToggleStatus(payment)}
          />
        ))}
      </div>
    </Card>
  );
}
