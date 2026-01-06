import { memo, useMemo } from 'react';
import { Card } from "@/shared/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { formatCurrency } from "./SummaryCard";

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

interface CategoryPieChartProps {
  data: CategoryData[];
  title?: string;
}

function CategoryPieChartComponent({ data, title = "Despesas por Categoria" }: CategoryPieChartProps) {
  // ⚡ OTIMIZAÇÃO: Memoizar cálculo do total para evitar recalcular em todo render
  const total = useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data]);

  return (
    <Card className="p-6" data-testid="chart-category-pie">
      <h3 className="text-base font-medium mb-4">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.375rem",
              }}
              formatter={(value: number) => [
                formatCurrency(value),
                `${((value / total) * 100).toFixed(1)}%`,
              ]}
            />
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              formatter={(value, entry: any) => (
                <span className="text-xs text-foreground">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

// ⚡ OTIMIZAÇÃO: Memoizar componente para evitar re-renders desnecessários
export const CategoryPieChart = memo(CategoryPieChartComponent);
