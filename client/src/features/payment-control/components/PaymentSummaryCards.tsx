import { Card, CardContent } from "@/shared/components/ui/card";
import { useMemo } from "react";
import { formatCurrency } from "@/features/dashboard/components/SummaryCard";
import { isToday, isBefore } from "date-fns";
import type { Transaction } from "@/features/transactions/components/TransactionItem";

interface PaymentSummaryCardsProps {
  payments: Transaction[];
}

export function PaymentSummaryCards({ payments }: PaymentSummaryCardsProps) {
  const summary = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let overdue = 0;
    let dueToday = 0;
    let upcoming = 0;
    let paid = 0;
    let total = 0;

    payments.forEach(payment => {
      total += payment.amount;

      if (payment.isPaid) {
        paid += payment.amount;
      } else if (payment.dueDate && isBefore(payment.dueDate, today)) {
        overdue += payment.amount;
      } else if (payment.dueDate && isToday(payment.dueDate)) {
        dueToday += payment.amount;
      } else {
        upcoming += payment.amount;
      }
    });

    return { overdue, dueToday, upcoming, paid, total };
  }, [payments]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">Vencidos</p>
          <p className="text-2xl font-bold text-destructive">
            {formatCurrency(summary.overdue)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">Vencem hoje</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {formatCurrency(summary.dueToday)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">A vencer</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {formatCurrency(summary.upcoming)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">Pagos</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(summary.paid)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">Total do período</p>
          <p className="text-2xl font-bold">
            {formatCurrency(summary.total)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
