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

  // Dados mockados para exibir gráfico vazio
  const displayData = data.length > 0 ? data : [
    { name: "Sem dados", value: 1, color: "hsl(var(--muted))" }
  ];

  return (
    <Card className="p-4" data-testid="chart-category-pie">
      <h3 className="text-sm font-medium mb-3">{title}</h3>
      <div className="h-48">
        {data.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-xs text-muted-foreground bg-background/80 px-3 py-1.5 rounded">
              Nenhuma despesa registrada
            </p>
          </div>
        )}
        <div className="relative h-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={displayData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={60}
                paddingAngle={data.length > 0 ? 2 : 0}
                dataKey="value"
              >
                {displayData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              {data.length > 0 && (
                <>
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
                </>
              )}
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}

// ⚡ OTIMIZAÇÃO: Memoizar componente para evitar re-renders desnecessários
export const CategoryPieChart = memo(CategoryPieChartComponent);
