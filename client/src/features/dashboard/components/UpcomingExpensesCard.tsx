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
  isPaid?: boolean;
}

interface UpcomingExpensesCardProps {
  expenses: UpcomingExpense[];
  maxItems?: number;
}

function UpcomingExpensesCardComponent({ expenses, maxItems = 5 }: UpcomingExpensesCardProps) {
  const sortedExpenses = useMemo(() => {
    const today = startOfDay(new Date());
    const next30Days = addDays(today, 30);

    // Filtra despesas não pagas, atrasadas (antes de hoje) e próximas (até 30 dias)
    return expenses
      .filter(e => !e.isPaid) // Remove transações já pagas
      .filter(e => isBefore(e.dueDate, next30Days)) // Até 30 dias no futuro ou qualquer atrasada
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
      .slice(0, maxItems);
  }, [expenses, maxItems]);

  const getUrgencyColor = (daysUntilDue: number) => {
    if (daysUntilDue < 0) return "text-destructive"; // Atrasada
    if (daysUntilDue === 0) return "text-destructive"; // Hoje
    if (daysUntilDue <= 3) return "text-orange-500";
    if (daysUntilDue <= 7) return "text-yellow-600";
    return "text-muted-foreground";
  };

  const getUrgencyBadge = (daysUntilDue: number) => {
    if (daysUntilDue < 0) return {
      label: `${Math.abs(daysUntilDue)} ${Math.abs(daysUntilDue) === 1 ? 'dia' : 'dias'} atraso`,
      variant: "destructive" as const
    };
    if (daysUntilDue === 0) return { label: "Hoje", variant: "destructive" as const };
    if (daysUntilDue === 1) return { label: "Amanhã", variant: "destructive" as const };
    if (daysUntilDue <= 3) return { label: `${daysUntilDue} dias`, variant: "default" as const };
    if (daysUntilDue <= 7) return { label: `${daysUntilDue} dias`, variant: "secondary" as const };
    return { label: `${daysUntilDue} dias`, variant: "outline" as const };
  };

  const totalUpcoming = useMemo(() => {
    return sortedExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [sortedExpenses]);

  const overdueCount = useMemo(() => {
    return sortedExpenses.filter(e => e.daysUntilDue < 0).length;
  }, [sortedExpenses]);

  return (
    <Card className="p-4" data-testid="upcoming-expenses-card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium">Controle de Pagamento</h3>
          {overdueCount > 0 && (
            <Badge variant="destructive" className="text-[10px] h-4 px-1.5">
              {overdueCount} atrasada{overdueCount > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        <Calendar className="h-4 w-4 text-muted-foreground" />
      </div>

      {sortedExpenses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <AlertCircle className="h-8 w-8 text-muted-foreground/50 mb-2" />
          <p className="text-xs text-muted-foreground">
            Nenhuma despesa com vencimento registrada
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-2 mb-3">
            {sortedExpenses.map((expense) => {
              const badge = getUrgencyBadge(expense.daysUntilDue);
              const isOverdue = expense.daysUntilDue < 0;
              return (
                <div
                  key={expense.id}
                  className={`flex items-center justify-between p-2 rounded-md transition-colors ${
                    isOverdue
                      ? 'bg-destructive/10 hover:bg-destructive/20 border border-destructive/20'
                      : 'bg-muted/30 hover:bg-muted/50'
                  }`}
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
              <span className="text-xs text-muted-foreground">
                Total {sortedExpenses.length} {sortedExpenses.length === 1 ? 'despesa' : 'despesas'}
              </span>
              <span className="text-sm font-semibold font-mono">{formatCurrency(totalUpcoming)}</span>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}

export const UpcomingExpensesCard = memo(UpcomingExpensesCardComponent);
