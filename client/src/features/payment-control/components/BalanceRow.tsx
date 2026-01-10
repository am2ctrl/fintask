import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Check, RotateCcw, Eye, Pencil, Trash2, ChevronDown, ArrowUpCircle, ArrowDownCircle, Import } from "lucide-react";
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

interface BalanceRowProps {
  payment: Transaction;
  onClick: () => void;
  onToggleStatus: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function BalanceRow({ payment, onClick, onToggleStatus, onEdit, onDelete }: BalanceRowProps) {
  const statusInfo = getTransactionStatusInfo(payment);
  const isIncome = payment.type === "income";

  return (
    <div className="grid grid-cols-[100px_100px_1fr_80px_120px_120px_100px_90px] gap-4 p-4 hover:bg-accent/50 transition-colors items-center">
      <div className="text-sm">
        {payment.dueDate ? format(payment.dueDate, "dd/MM/yyyy", { locale: ptBR }) : "-"}
      </div>

      <div className="text-sm text-muted-foreground">
        {payment.isPaid && payment.date
          ? format(payment.date, "dd/MM/yyyy", { locale: ptBR })
          : "-"}
      </div>

      <div>
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">{payment.name}</p>
          {payment.source && payment.source !== "manual" && (
            <Badge
              variant="secondary"
              className="text-[10px] px-1.5 py-0 h-4 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
            >
              <Import className="w-3 h-3 mr-1" />
              Importado
            </Badge>
          )}
        </div>
        {(payment.isRecurring || payment.mode === "parcelada") && payment.installmentNumber && payment.installmentsTotal && (
          <Badge variant="outline" className="text-[10px] mt-1">
            {payment.installmentNumber}/{payment.installmentsTotal}
          </Badge>
        )}
      </div>

      <div className="flex justify-center">
        {isIncome ? (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 text-xs">
            <ArrowUpCircle className="h-3 w-3 mr-1" />
            Receita
          </Badge>
        ) : (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100 text-xs">
            <ArrowDownCircle className="h-3 w-3 mr-1" />
            Despesa
          </Badge>
        )}
      </div>

      <div className={`text-sm font-mono text-right ${isIncome ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
        {isIncome ? "+" : "-"}{formatCurrency(payment.amount)}
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
