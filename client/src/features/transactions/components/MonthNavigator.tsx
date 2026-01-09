import { format, addMonths, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface MonthNavigatorProps {
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
}

export function MonthNavigator({ currentMonth, onMonthChange }: MonthNavigatorProps) {
  const handlePreviousMonth = () => {
    onMonthChange(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    onMonthChange(addMonths(currentMonth, 1));
  };

  const monthLabel = format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR });
  const capitalizedLabel = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={handlePreviousMonth}
        aria-label="Mês anterior"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="min-w-48 text-center font-medium">
        {capitalizedLabel}
      </span>
      <Button
        variant="outline"
        size="icon"
        onClick={handleNextMonth}
        aria-label="Próximo mês"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function getMonthDateRange(date: Date): { dateFrom: Date; dateTo: Date } {
  return {
    dateFrom: startOfMonth(date),
    dateTo: endOfMonth(date),
  };
}
