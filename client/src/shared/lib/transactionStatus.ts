import { isBefore, startOfDay, isToday } from "date-fns";

export type TransactionStatus = "paid" | "pending" | "overdue" | "due_today";

export interface StatusInfo {
  status: TransactionStatus;
  label: string;
  badgeClassName: string;
  rowClassName: string;
}

export function getTransactionStatusInfo(transaction: {
  isPaid?: boolean;
  dueDate?: Date | null;
}): StatusInfo {
  const today = startOfDay(new Date());

  if (transaction.isPaid) {
    return {
      status: "paid",
      label: "Pago",
      badgeClassName: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      rowClassName: "",
    };
  }

  if (transaction.dueDate) {
    const dueDateNormalized = startOfDay(transaction.dueDate);

    if (isBefore(dueDateNormalized, today)) {
      return {
        status: "overdue",
        label: "Vencido",
        badgeClassName: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        rowClassName: "border-l-4 border-l-red-500 bg-red-50/50 dark:bg-red-950/20",
      };
    }

    if (isToday(transaction.dueDate)) {
      return {
        status: "due_today",
        label: "Vence Hoje",
        badgeClassName: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
        rowClassName: "border-l-4 border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-950/20",
      };
    }
  }

  return {
    status: "pending",
    label: "Em Aberto",
    badgeClassName: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    rowClassName: "opacity-70",
  };
}
