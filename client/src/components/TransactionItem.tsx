import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Pencil, Trash2, Repeat, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CategoryBadge, type Category } from "./CategoryBadge";
import { formatCurrency } from "./SummaryCard";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type TransactionMode = "avulsa" | "recorrente" | "parcelada";

export interface Transaction {
  id: string;
  date: Date;
  amount: number;
  type: "income" | "expense";
  category: Category;
  description: string;
  mode?: TransactionMode;
  installmentNumber?: number;
  installmentsTotal?: number;
}

export const transactionModeInfo = {
  avulsa: {
    label: "Avulsa",
    description: "Transação única, sem repetição. Ex: compra pontual, presente, reembolso.",
    icon: null,
  },
  recorrente: {
    label: "Recorrente",
    description: "Despesa que se repete todo mês com valor igual ou similar. Ex: aluguel, Netflix, plano de celular, academia.",
    icon: Repeat,
    examples: ["Aluguel", "Netflix", "Spotify", "Internet", "Academia", "Plano de saúde"],
  },
  parcelada: {
    label: "Parcelada",
    description: "Compra dividida em parcelas fixas. Ex: TV em 10x, celular em 12x, móveis em 6x.",
    icon: CreditCard,
    examples: ["TV 10x", "Celular 12x", "Geladeira 6x", "Viagem 8x"],
  },
};

interface TransactionItemProps {
  transaction: Transaction;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (id: string) => void;
}

export function TransactionItem({ transaction, onEdit, onDelete }: TransactionItemProps) {
  const mode = transaction.mode || "avulsa";
  const modeInfo = transactionModeInfo[mode];
  const ModeIcon = modeInfo.icon;

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
          {mode !== "avulsa" && (
            <div className="flex items-center gap-1.5 mt-0.5">
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
              {mode === "recorrente" && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 cursor-help border-blue-500/50 text-blue-600 dark:text-blue-400">
                      <Repeat className="w-3 h-3 mr-1" />
                      Recorrente
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    {modeInfo.description}
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          )}
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
          className={`text-xs cursor-help ${
            mode === "recorrente" 
              ? "border-blue-500/50 text-blue-600 dark:text-blue-400" 
              : "border-purple-500/50 text-purple-600 dark:text-purple-400"
          }`}
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
