import { useState } from "react";
import { format, addMonths, subMonths, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";

interface MonthCalendarProps {
  selectedMonth: Date;
  onMonthChange: (month: Date) => void;
}

const months = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez"
];

export function MonthCalendar({ selectedMonth, onMonthChange }: MonthCalendarProps) {
  const [viewYear, setViewYear] = useState(selectedMonth.getFullYear());
  const [open, setOpen] = useState(false);

  const handleMonthSelect = (monthIndex: number) => {
    const newDate = new Date(viewYear, monthIndex, 1);
    onMonthChange(newDate);
    setOpen(false);
  };

  const handlePrevMonth = () => {
    onMonthChange(subMonths(selectedMonth, 1));
  };

  const handleNextMonth = () => {
    onMonthChange(addMonths(selectedMonth, 1));
  };

  const isCurrentMonth = (monthIndex: number) => {
    return selectedMonth.getMonth() === monthIndex && 
           selectedMonth.getFullYear() === viewYear;
  };

  return (
    <div className="flex items-center gap-2" data-testid="month-calendar">
      <Button
        variant="ghost"
        size="icon"
        onClick={handlePrevMonth}
        data-testid="button-prev-month"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="min-w-40 justify-center gap-2"
            data-testid="button-month-picker"
          >
            <Calendar className="h-4 w-4" />
            {format(selectedMonth, "MMMM yyyy", { locale: ptBR })}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-4" align="center">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewYear((y) => y - 1)}
                data-testid="button-prev-year"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-semibold">{viewYear}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewYear((y) => y + 1)}
                data-testid="button-next-year"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {months.map((month, index) => (
                <Button
                  key={month}
                  variant={isCurrentMonth(index) ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleMonthSelect(index)}
                  className="text-xs"
                  data-testid={`button-month-${index}`}
                >
                  {month}
                </Button>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Button
        variant="ghost"
        size="icon"
        onClick={handleNextMonth}
        data-testid="button-next-month"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
