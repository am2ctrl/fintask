import { memo } from 'react';
import { Card } from "@/shared/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatCurrency } from "./SummaryCard";

interface ChartDataPoint {
  month: string;
  income: number;
  expense: number;
}

interface IncomeExpenseChartProps {
  data: ChartDataPoint[];
}

function IncomeExpenseChartComponent({ data }: IncomeExpenseChartProps) {
  const hasData = data.some(d => d.income > 0 || d.expense > 0);

  return (
    <Card className="p-6" data-testid="chart-income-expense">
      <h3 className="text-base font-medium mb-4">Receitas vs Despesas</h3>
      <div className="h-64">
        {!hasData ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            <p>Nenhuma transação registrada nos últimos 6 meses</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(142 76% 36%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(142 76% 36%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(0 84% 45%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(0 84% 45%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="month"
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.375rem",
                }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="income"
                name="Receitas"
                stroke="hsl(142 76% 36%)"
                strokeWidth={2}
                fill="url(#incomeGradient)"
              />
              <Area
                type="monotone"
                dataKey="expense"
                name="Despesas"
                stroke="hsl(0 84% 45%)"
                strokeWidth={2}
                fill="url(#expenseGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}

// ⚡ OTIMIZAÇÃO: Memoizar componente para evitar re-renders desnecessários
export const IncomeExpenseChart = memo(IncomeExpenseChartComponent);
