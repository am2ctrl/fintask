import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Check, Eye } from "lucide-react";
import { formatCurrency } from "@/features/dashboard/components/SummaryCard";
import { getTransactionStatus, statusConfig, type Transaction } from "@/features/transactions/components/TransactionItem";

interface PaymentRowProps {
  payment: Transaction;
  onClick: () => void;
  onToggleStatus: () => void;
}

export function PaymentRow({ payment, onClick, onToggleStatus }: PaymentRowProps) {
  const status = getTransactionStatus(payment);
  const statusInfo = statusConfig[status];

  return (
    <div className="grid grid-cols-[100px_100px_1fr_120px_120px_100px_90px] gap-4 p-4 hover:bg-accent/50 transition-colors items-center">
      <div className="text-sm">
        {payment.dueDate ? format(payment.dueDate, "dd/MM/yyyy", { locale: ptBR }) : "-"}
      </div>

      <div className="text-sm text-muted-foreground">
        {payment.isPaid && payment.date
          ? format(payment.date, "dd/MM/yyyy", { locale: ptBR })
          : "-"}
      </div>

      <div>
        <p className="text-sm font-medium">{payment.name}</p>
        {(payment.isRecurring || payment.mode === "parcelada") && payment.installmentNumber && payment.installmentsTotal && (
          <Badge variant="outline" className="text-[10px] mt-1">
            {payment.installmentNumber}/{payment.installmentsTotal}
          </Badge>
        )}
      </div>

      <div className="text-sm font-mono text-right">
        {formatCurrency(payment.amount)}
      </div>

      <div className="text-sm font-mono text-right">
        {payment.isPaid ? "-" : formatCurrency(payment.amount)}
      </div>

      <div className="flex justify-center">
        <Badge className={`${statusInfo.className} text-xs`}>
          {statusInfo.label}
        </Badge>
      </div>

      <div className="flex items-center gap-1 justify-center">
        {!payment.isPaid && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              onToggleStatus();
            }}
          >
            <Check className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onClick}
        >
          <Eye className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
