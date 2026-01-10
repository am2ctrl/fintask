import { Card } from "@/shared/components/ui/card";
import { formatCurrency } from "@/features/dashboard/components/SummaryCard";
import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import type { TransactionSummary } from "@/shared/hooks/useTransactionCalculations";

interface TransactionSummaryCardsProps {
  summary: TransactionSummary;
}

interface SummaryCardItemProps {
  label: string;
  value: number;
  colorClass: string;
  tooltip?: string;
}

function SummaryCardItem({ label, value, colorClass, tooltip }: SummaryCardItemProps) {
  return (
    <Card className="p-4 flex-1 min-w-36">
      <div className="flex items-center gap-1 mb-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        {tooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      <p className={`text-lg font-mono font-bold ${colorClass}`}>
        {formatCurrency(value)}
      </p>
    </Card>
  );
}

export function TransactionSummaryCards({ summary }: TransactionSummaryCardsProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <SummaryCardItem
        label="Saldo Real"
        value={summary.saldoReal}
        colorClass={summary.saldoReal >= 0 ? "text-green-600 dark:text-green-400" : "text-destructive"}
        tooltip="Receitas recebidas menos despesas pagas"
      />
      <SummaryCardItem
        label="A Receber"
        value={summary.aReceber}
        colorClass="text-blue-600 dark:text-blue-400"
        tooltip="Total de receitas ainda pendentes"
      />
      <SummaryCardItem
        label="A Pagar"
        value={summary.aPagar}
        colorClass="text-orange-600 dark:text-orange-400"
        tooltip="Total de despesas ainda pendentes"
      />
      <SummaryCardItem
        label="Saldo Previsto"
        value={summary.saldoPrevisto}
        colorClass={summary.saldoPrevisto >= 0 ? "text-green-600 dark:text-green-400" : "text-destructive"}
        tooltip="Saldo Real + A Receber - A Pagar"
      />
    </div>
  );
}
