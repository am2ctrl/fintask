import { format, isBefore, startOfDay, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Repeat, CreditCard, Check, RotateCcw } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { CategoryBadge, type Category } from "@/features/categories/components/CategoryBadge";
import { formatCurrency } from "@/features/dashboard/components/SummaryCard";
import { getTransactionStatusInfo } from "@/shared/lib/transactionStatus";
import { cn } from "@/shared/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";

export type TransactionMode = "avulsa" | "parcelada";
export type TransactionStatus = "paid" | "pending" | "overdue" | "due_today";

export interface Transaction {
  id: string;
  date: Date;
  amount: number;
  type: "income" | "expense";
  category: Category;
  name: string;
  description?: string | null;
  mode?: TransactionMode;
  installmentNumber?: number;
  installmentsTotal?: number;
  card?: {
    id: string;
    name: string;
    lastFourDigits: string;
    cardType: "physical" | "virtual";
  } | null;
  familyMember?: {
    id: string;
    name: string;
  } | null;
  dueDate?: Date | null;
  isPaid?: boolean;
  isRecurring?: boolean;
  recurringMonths?: number | null;
}

export const transactionModeInfo = {
  avulsa: {
    label: "Avulsa",
    description: "Transacao unica, sem repeticao. Ex: compra pontual, presente, reembolso.",
    icon: null,
  },
  recorrente: {
    label: "Recorrente",
    description: "Despesa que se repete todo mes com valor igual ou similar. Ex: aluguel, Netflix, plano de celular, academia.",
    icon: Repeat,
    examples: ["Aluguel", "Netflix", "Spotify", "Internet", "Academia", "Plano de saude"],
  },
  parcelada: {
    label: "Parcelada",
    description: "Compra dividida em parcelas fixas. Ex: TV em 10x, celular em 12x, moveis em 6x.",
    icon: CreditCard,
    examples: ["TV 10x", "Celular 12x", "Geladeira 6x", "Viagem 8x"],
  },
};

export function getTransactionStatus(transaction: Transaction): TransactionStatus {
  const today = startOfDay(new Date());

  if (transaction.isPaid) return "paid";

  if (transaction.dueDate) {
    const dueDateNormalized = startOfDay(transaction.dueDate);

    if (isBefore(dueDateNormalized, today)) {
      return "overdue";
    }

    if (isToday(transaction.dueDate)) {
      return "due_today";
    }
  }

  return "pending";
}

export const statusConfig: Record<TransactionStatus, { label: string; className: string }> = {
  paid: { label: "Pago", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
  pending: { label: "Em Aberto", className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
  overdue: { label: "Vencido", className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
  due_today: { label: "Vence Hoje", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
};

interface TransactionItemProps {
  transaction: Transaction;
  runningBalanceReal?: number;
  runningBalancePrevisto?: number;
  showDualBalance?: boolean;
  onToggleStatus?: (transaction: Transaction) => void;
}

export function TransactionItem({
  transaction,
  runningBalanceReal,
  runningBalancePrevisto,
  showDualBalance = true,
  onToggleStatus
}: TransactionItemProps) {
  const mode = transaction.mode || "avulsa";
  const statusInfo = getTransactionStatusInfo(transaction);

  return (
    <div
      className={cn(
        "group flex items-center justify-between gap-4 p-4 hover:bg-accent/50 transition-colors",
        statusInfo.rowClassName
      )}
      data-testid={`row-transaction-${transaction.id}`}
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="text-sm text-muted-foreground w-24 shrink-0">
          {format(transaction.date, "dd/MM/yyyy", { locale: ptBR })}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{transaction.name}</p>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            <CategoryBadge category={transaction.category} size="sm" />
            {mode === "parcelada" && transaction.installmentNumber && transaction.installmentsTotal && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 cursor-help">
                    <CreditCard className="w-3 h-3 mr-1" />
                    {transaction.installmentNumber}/{transaction.installmentsTotal}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  Parcela {transaction.installmentNumber} de {transaction.installmentsTotal}
                </TooltipContent>
              </Tooltip>
            )}
            {transaction.card && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                {transaction.card.name}
              </Badge>
            )}
            {transaction.familyMember && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-purple-500/50 text-purple-600 dark:text-purple-400">
                {transaction.familyMember.name.split(' ')[0]}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Badge className={`${statusInfo.badgeClassName} text-xs px-2 py-0.5 font-medium`}>
          {statusInfo.label}
        </Badge>

        <span
          className={`font-mono text-sm font-semibold w-28 text-right ${
            transaction.type === "income" ? "text-primary" : "text-destructive"
          }`}
        >
          {transaction.type === "income" ? "+" : "-"}
          {formatCurrency(transaction.amount)}
        </span>

        {showDualBalance && runningBalanceReal !== undefined && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className={cn(
                  "font-mono text-sm w-28 text-right cursor-help",
                  runningBalanceReal >= 0 ? "text-green-600 dark:text-green-400" : "text-destructive"
                )}
              >
                {formatCurrency(runningBalanceReal)}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Saldo Real (apenas transacoes pagas)</p>
            </TooltipContent>
          </Tooltip>
        )}

        {showDualBalance && runningBalancePrevisto !== undefined && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className={cn(
                  "font-mono text-sm w-28 text-right cursor-help",
                  runningBalancePrevisto >= 0 ? "text-muted-foreground" : "text-destructive/70"
                )}
              >
                {formatCurrency(runningBalancePrevisto)}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Saldo Previsto (todas as transacoes)</p>
            </TooltipContent>
          </Tooltip>
        )}

        {onToggleStatus && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => onToggleStatus(transaction)}
              >
                {transaction.isPaid ? (
                  <>
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Reabrir
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Pagar
                  </>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {transaction.isPaid ? "Voltar para em aberto" : "Marcar como pago"}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
}

export function ModeBadge({ mode, installmentNumber, installmentsTotal }: {
  mode: TransactionMode;
  installmentNumber?: number;
  installmentsTotal?: number;
}) {
  const info = transactionModeInfo[mode];
  const Icon = info.icon;

  if (mode === "avulsa") return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          variant="outline"
          className="text-xs cursor-help border-purple-500/50 text-purple-600 dark:text-purple-400"
        >
          {Icon && <Icon className="w-3 h-3 mr-1" />}
          {mode === "parcelada" && installmentNumber && installmentsTotal
            ? `${installmentNumber}/${installmentsTotal}`
            : info.label}
        </Badge>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <p className="font-medium">{info.label}</p>
        <p className="text-xs text-muted-foreground mt-1">{info.description}</p>
      </TooltipContent>
    </Tooltip>
  );
}
