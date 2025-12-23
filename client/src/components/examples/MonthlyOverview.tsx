import { MonthlyOverview } from "../MonthlyOverview";
import { defaultCategories } from "../CategoryBadge";
import type { Transaction } from "../TransactionItem";

// todo: remove mock data
const mockTransactions: Transaction[] = [
  { id: "1", date: new Date(2024, 11, 5), amount: 8500, type: "income", category: defaultCategories[0], description: "Salário" },
  { id: "2", date: new Date(2024, 11, 10), amount: 450, type: "expense", category: defaultCategories[4], description: "Supermercado" },
  { id: "3", date: new Date(2024, 11, 10), amount: 120, type: "expense", category: defaultCategories[5], description: "Uber" },
  { id: "4", date: new Date(2024, 11, 15), amount: 1200, type: "expense", category: defaultCategories[6], description: "Aluguel" },
  { id: "5", date: new Date(2024, 11, 20), amount: 2500, type: "income", category: defaultCategories[1], description: "Freelance" },
  { id: "6", date: new Date(2024, 11, 22), amount: 350, type: "expense", category: defaultCategories[9], description: "Lazer" },
];

export default function MonthlyOverviewExample() {
  return (
    <MonthlyOverview
      month={new Date(2024, 11, 1)}
      transactions={mockTransactions}
      onDayClick={(date, transactions) => console.log("Day clicked:", date, transactions)}
    />
  );
}
