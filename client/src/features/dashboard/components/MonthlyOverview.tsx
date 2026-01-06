import { format, eachDayOfInterval, startOfMonth, endOfMonth, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card } from "@/shared/components/ui/card";
import { formatCurrency } from "./SummaryCard";
import type { Transaction } from "@/features/transactions/components/TransactionItem";

interface MonthlyOverviewProps {
  month: Date;
  transactions: Transaction[];
  onDayClick?: (date: Date, transactions: Transaction[]) => void;
}

export function MonthlyOverview({ month, transactions, onDayClick }: MonthlyOverviewProps) {
  const days = eachDayOfInterval({
    start: startOfMonth(month),
    end: endOfMonth(month),
  });

  const firstDayOfWeek = startOfMonth(month).getDay();
  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const getTransactionsForDay = (date: Date) => {
    return transactions.filter((t) => isSameDay(t.date, date));
  };

  const getDayTotal = (date: Date) => {
    const dayTransactions = getTransactionsForDay(date);
    return dayTransactions.reduce((acc, t) => {
      return t.type === "income" ? acc + t.amount : acc - t.amount;
    }, 0);
  };

  const today = new Date();

  return (
    <Card className="p-6" data-testid="monthly-overview">
      <h3 className="text-base font-medium mb-4">
        Visão do Mês - {format(month, "MMMM yyyy", { locale: ptBR })}
      </h3>
      
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-muted-foreground py-2"
          >
            {day}
          </div>
        ))}

        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {days.map((day) => {
          const dayTransactions = getTransactionsForDay(day);
          const total = getDayTotal(day);
          const hasTransactions = dayTransactions.length > 0;
          const isToday = isSameDay(day, today);

          return (
            <button
              key={day.toISOString()}
              onClick={() => onDayClick?.(day, dayTransactions)}
              className={`
                aspect-square p-1 rounded-md text-xs flex flex-col items-center justify-start gap-0.5
                hover-elevate active-elevate-2
                ${isToday ? "ring-2 ring-primary" : ""}
                ${hasTransactions ? "bg-muted/50" : ""}
              `}
              data-testid={`day-${format(day, "yyyy-MM-dd")}`}
            >
              <span className={`font-medium ${isToday ? "text-primary" : ""}`}>
                {format(day, "d")}
              </span>
              {hasTransactions && (
                <>
                  <span className="text-muted-foreground text-[10px]">
                    {dayTransactions.length}
                  </span>
                  <span
                    className={`text-[10px] font-mono ${
                      total >= 0 ? "text-primary" : "text-destructive"
                    }`}
                  >
                    {total >= 0 ? "+" : ""}
                    {(total / 1000).toFixed(1)}k
                  </span>
                </>
              )}
            </button>
          );
        })}
      </div>
    </Card>
  );
}
