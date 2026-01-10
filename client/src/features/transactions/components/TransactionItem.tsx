import { format, isBefore, startOfDay, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Repeat, CreditCard, Check, RotateCcw, FileText, Landmark } from "lucide-react";
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
export type TransactionSource = "manual" | "credit_card_import" | "bank_statement_import";
// income/expense: Contam nos relatórios de gastos
// transfer_internal: Transferência entre contas próprias (não conta em relatórios)
// card_payment: Pagamento de fatura de cartão (não conta - já está detalhado na fatura)
export type TransactionType = "income" | "expense" | "transfer_internal" | "card_payment";

// Tipos que contam nos relatórios de receitas/despesas
export const COUNTABLE_TRANSACTION_TYPES: TransactionType[] = ["income", "expense"];

export interface Transaction {
  id: string;
  date: Date;
  amount: number;
  type: TransactionType;
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
  source?: TransactionSource;
  sourceBank?: string | null;
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

// Informações sobre tipos de transação (para badges e exibição)
export const transactionTypeInfo: Record<TransactionType, {
  label: string;
  shortLabel: string;
  description: string;
  className: string;
  countsInReports: boolean;
}> = {
  income: {
    label: "Receita",
    shortLabel: "Receita",
    description: "Dinheiro que entrou no seu patrimônio",
    className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    countsInReports: true,
  },
  expense: {
    label: "Despesa",
    shortLabel: "Despesa",
    description: "Dinheiro que saiu do seu patrimônio",
    className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    countsInReports: true,
  },
  transfer_internal: {
    label: "Transferência Interna",
    shortLabel: "Transf.",
    description: "Dinheiro movido entre suas próprias contas (não afeta relatórios)",
    className: "bg-slate-100 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400",
    countsInReports: false,
  },
  card_payment: {
    label: "Pagamento de Fatura",
    shortLabel: "Pgto Fatura",
    description: "Pagamento de fatura de cartão de crédito (já detalhado nas compras)",
    className: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    countsInReports: false,
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
            {/* Badge de origem: Extrato ou Fatura */}
            {transaction.source === "bank_statement_import" && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-emerald-500/50 text-emerald-600 dark:text-emerald-400">
                    <Landmark className="w-3 h-3 mr-1" />
                    Extrato
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>Importado de extrato bancário</TooltipContent>
              </Tooltip>
            )}
            {transaction.source === "credit_card_import" && !transaction.card && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-blue-500/50 text-blue-600 dark:text-blue-400">
                    <CreditCard className="w-3 h-3 mr-1" />
                    Fatura
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>Importado de fatura de cartão</TooltipContent>
              </Tooltip>
            )}
            {/* Badge de banco de origem */}
            {transaction.sourceBank && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-slate-400/50 text-slate-600 dark:text-slate-400">
                    <FileText className="w-3 h-3 mr-1" />
                    {transaction.sourceBank}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>Banco de origem: {transaction.sourceBank}</TooltipContent>
              </Tooltip>
            )}
            {/* Badge para tipos especiais (transfer_internal, card_payment) */}
            {(transaction.type === "transfer_internal" || transaction.type === "card_payment") && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge className={`${transactionTypeInfo[transaction.type].className} text-[10px] px-1.5 py-0 h-4`}>
                    {transaction.type === "transfer_internal" ? "↔" : "💳"} {transactionTypeInfo[transaction.type].shortLabel}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p className="font-medium">{transactionTypeInfo[transaction.type].label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{transactionTypeInfo[transaction.type].description}</p>
                </TooltipContent>
              </Tooltip>
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
            transaction.type === "income"
              ? "text-primary"
              : transaction.type === "transfer_internal" || transaction.type === "card_payment"
              ? "text-muted-foreground"
              : "text-destructive"
          }`}
        >
          {transaction.type === "income" ? "+" : transaction.type === "transfer_internal" || transaction.type === "card_payment" ? "↔" : "-"}
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
