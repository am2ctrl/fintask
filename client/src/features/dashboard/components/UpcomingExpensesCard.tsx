import { memo, useMemo } from 'react';
import { Card } from "@/shared/components/ui/card";
import { formatCurrency } from "./SummaryCard";
import { format, isAfter, isBefore, addDays, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, AlertCircle } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";

interface UpcomingExpense {
  id: string;
  description: string;
  amount: number;
  dueDate: Date;
  categoryName: string;
  categoryColor: string;
  daysUntilDue: number;
}

interface UpcomingExpensesCardProps {
  expenses: UpcomingExpense[];
  maxItems?: number;
}

function UpcomingExpensesCardComponent({ expenses, maxItems = 5 }: UpcomingExpensesCardProps) {
  const sortedExpenses = useMemo(() => {
    const today = startOfDay(new Date());
    const next30Days = addDays(today, 30);

    return expenses
      .filter(e => {
        const dueDate = startOfDay(e.dueDate);
        return isAfter(dueDate, today) || dueDate.getTime() === today.getTime();
      })
      .filter(e => isBefore(e.dueDate, next30Days))
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
      .slice(0, maxItems);
  }, [expenses, maxItems]);

  const getUrgencyColor = (daysUntilDue: number) => {
    if (daysUntilDue === 0) return "text-destructive";
    if (daysUntilDue <= 3) return "text-orange-500";
    if (daysUntilDue <= 7) return "text-yellow-600";
    return "text-muted-foreground";
  };

  const getUrgencyBadge = (daysUntilDue: number) => {
    if (daysUntilDue === 0) return { label: "Hoje", variant: "destructive" as const };
    if (daysUntilDue === 1) return { label: "Amanhã", variant: "destructive" as const };
    if (daysUntilDue <= 3) return { label: `${daysUntilDue} dias`, variant: "default" as const };
    if (daysUntilDue <= 7) return { label: `${daysUntilDue} dias`, variant: "secondary" as const };
    return { label: `${daysUntilDue} dias`, variant: "outline" as const };
  };

  const totalUpcoming = useMemo(() => {
    return sortedExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [sortedExpenses]);

  return (
    <Card className="p-4" data-testid="upcoming-expenses-card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium">Próximas Despesas</h3>
        <Calendar className="h-4 w-4 text-muted-foreground" />
      </div>

      {sortedExpenses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <AlertCircle className="h-8 w-8 text-muted-foreground/50 mb-2" />
          <p className="text-xs text-muted-foreground">
            Nenhuma despesa com vencimento nos próximos 30 dias
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-2 mb-3">
            {sortedExpenses.map((expense) => {
              const badge = getUrgencyBadge(expense.daysUntilDue);
              return (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-2 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0 mr-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: expense.categoryColor }}
                      />
                      <p className="text-xs font-medium truncate">
                        {expense.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] text-muted-foreground">
                        {format(expense.dueDate, "dd/MM/yyyy", { locale: ptBR })}
                      </p>
                      <Badge variant={badge.variant} className="text-[10px] h-4 px-1">
                        {badge.label}
                      </Badge>
                    </div>
                  </div>
                  <div className={`text-xs font-mono font-semibold ${getUrgencyColor(expense.daysUntilDue)}`}>
                    {formatCurrency(expense.amount)}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Total próximos {sortedExpenses.length}</span>
              <span className="text-sm font-semibold font-mono">{formatCurrency(totalUpcoming)}</span>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}

export const UpcomingExpensesCard = memo(UpcomingExpensesCardComponent);
