import { Card } from "@/shared/components/ui/card";
import { useMemo } from "react";
import { formatCurrency } from "@/features/dashboard/components/SummaryCard";
import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import type { Transaction } from "@/features/transactions/components/TransactionItem";

interface BalanceSummaryCardsProps {
  payments: Transaction[];
}

interface SummaryCardItemProps {
  label: string;
  value: number;
  colorClass: string;
  tooltip: string;
}

function SummaryCardItem({ label, value, colorClass, tooltip }: SummaryCardItemProps) {
  return (
    <Card className="p-4 flex-1 min-w-36">
      <div className="flex items-center gap-1 mb-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        <Tooltip>
          <TooltipTrigger asChild>
            <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </div>
      <p className={`text-2xl font-bold ${colorClass}`}>
        {formatCurrency(value)}
      </p>
    </Card>
  );
}

export function BalanceSummaryCards({ payments }: BalanceSummaryCardsProps) {
  const summary = useMemo(() => {
    let receitasPagas = 0;
    let despesasPagas = 0;
    let receitasPendentes = 0;
    let despesasPendentes = 0;

    payments.forEach(payment => {
      if (payment.type === "income") {
        if (payment.isPaid) {
          receitasPagas += payment.amount;
        } else {
          receitasPendentes += payment.amount;
        }
      } else {
        if (payment.isPaid) {
          despesasPagas += payment.amount;
        } else {
          despesasPendentes += payment.amount;
        }
      }
    });

    const saldoReal = receitasPagas - despesasPagas;
    const aReceber = receitasPendentes;
    const aPagar = despesasPendentes;
    const saldoPrevisto = saldoReal + aReceber - aPagar;

    return { saldoReal, aReceber, aPagar, saldoPrevisto };
  }, [payments]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
