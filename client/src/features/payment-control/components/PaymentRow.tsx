import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Check, RotateCcw, Eye, Pencil, Trash2, ChevronDown } from "lucide-react";
import { formatCurrency } from "@/features/dashboard/components/SummaryCard";
import type { Transaction } from "@/features/transactions/components/TransactionItem";
import { getTransactionStatusInfo } from "@/shared/lib/transactionStatus";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

interface PaymentRowProps {
  payment: Transaction;
  onClick: () => void;
  onToggleStatus: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function PaymentRow({ payment, onClick, onToggleStatus, onEdit, onDelete }: PaymentRowProps) {
  const statusInfo = getTransactionStatusInfo(payment);

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
        <Badge className={`${statusInfo.badgeClassName} text-xs`}>
          {statusInfo.label}
        </Badge>
      </div>

      <div className="flex items-center justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              Acoes
              <ChevronDown className="ml-1 h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onClick}>
              <Eye className="mr-2 h-4 w-4" />
              Ver detalhes
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onToggleStatus}>
              {payment.isPaid ? (
                <>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Voltar para em aberto
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Marcar como pago
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onDelete}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
