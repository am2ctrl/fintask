import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { format, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MonthYearNavigatorProps {
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
}

export function MonthYearNavigator({ currentMonth, onMonthChange }: MonthYearNavigatorProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onMonthChange(subMonths(currentMonth, 1))}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="min-w-40 text-center font-medium">
        {format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR })}
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={() => onMonthChange(addMonths(currentMonth, 1))}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
