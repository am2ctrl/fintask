import { Card } from "@/shared/components/ui/card";
import { TrendingUp, TrendingDown, Wallet, ArrowUpCircle, ArrowDownCircle } from "lucide-react";

export type SummaryCardType = "balance" | "income" | "expense";

interface SummaryCardProps {
  type: SummaryCardType;
  value: number;
  trend?: number;
  label: string;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function SummaryCard({ type, value, trend, label }: SummaryCardProps) {
  const icons = {
    balance: Wallet,
    income: ArrowUpCircle,
    expense: ArrowDownCircle,
  };

  const colors = {
    balance: "text-chart-2",
    income: "text-primary",
    expense: "text-destructive",
  };

  const bgColors = {
    balance: "bg-chart-2/10",
    income: "bg-primary/10",
    expense: "bg-destructive/10",
  };

  const Icon = icons[type];

  return (
    <Card className="p-6 min-h-32" data-testid={`card-summary-${type}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className={`text-2xl font-mono font-bold ${colors[type]}`}>
            {formatCurrency(value)}
          </p>
          {trend !== undefined && (
            <div className="flex items-center gap-1 text-xs">
              {trend >= 0 ? (
                <TrendingUp className="h-3 w-3 text-primary" />
              ) : (
                <TrendingDown className="h-3 w-3 text-destructive" />
              )}
              <span className={trend >= 0 ? "text-primary" : "text-destructive"}>
                {trend >= 0 ? "+" : ""}
                {trend.toFixed(1)}%
              </span>
              <span className="text-muted-foreground">vs mês anterior</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${bgColors[type]}`}>
          <Icon className={`h-6 w-6 ${colors[type]}`} />
        </div>
      </div>
    </Card>
  );
}
