import { Card } from "@/shared/components/ui/card";
import { formatCurrency } from "@/features/dashboard/components/SummaryCard";
import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import type { Transaction } from "./TransactionItem";

interface TransactionSummaryCardsProps {
  transactions: Transaction[];
}

interface SummaryData {
  incomeOpen: number;
  incomeRealized: number;
  expenseOpen: number;
  expenseRealized: number;
  total: number;
}

function calculateSummary(transactions: Transaction[]): SummaryData {
  const summary: SummaryData = {
    incomeOpen: 0,
    incomeRealized: 0,
    expenseOpen: 0,
    expenseRealized: 0,
    total: 0,
  };

  for (const t of transactions) {
    if (t.type === "income") {
      if (t.isPaid) {
        summary.incomeRealized += t.amount;
      } else {
        summary.incomeOpen += t.amount;
      }
      summary.total += t.amount;
    } else {
      if (t.isPaid) {
        summary.expenseRealized += t.amount;
      } else {
        summary.expenseOpen += t.amount;
      }
      summary.total -= t.amount;
    }
  }

  return summary;
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

export function TransactionSummaryCards({ transactions }: TransactionSummaryCardsProps) {
  const summary = calculateSummary(transactions);

  return (
    <div className="flex flex-wrap gap-3">
      <SummaryCardItem
        label="Receitas em aberto (R$)"
        value={summary.incomeOpen}
        colorClass="text-primary"
        tooltip="Receitas previstas que ainda não foram recebidas"
      />
      <SummaryCardItem
        label="Receitas realizadas (R$)"
        value={summary.incomeRealized}
        colorClass="text-primary"
        tooltip="Receitas que já foram recebidas"
      />
      <SummaryCardItem
        label="Despesas em aberto (R$)"
        value={summary.expenseOpen}
        colorClass="text-destructive"
        tooltip="Despesas previstas que ainda não foram pagas"
      />
      <SummaryCardItem
        label="Despesas realizadas (R$)"
        value={summary.expenseRealized}
        colorClass="text-destructive"
        tooltip="Despesas que já foram pagas"
      />
      <SummaryCardItem
        label="Total do período (R$)"
        value={summary.total}
        colorClass={summary.total >= 0 ? "text-chart-2" : "text-destructive"}
        tooltip="Resultado líquido do período (receitas - despesas)"
      />
    </div>
  );
}
