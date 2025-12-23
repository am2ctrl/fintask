import { TransactionList } from "../TransactionList";
import { defaultCategories } from "../CategoryBadge";
import type { Transaction } from "../TransactionItem";

// todo: remove mock data
const mockTransactions: Transaction[] = [
  {
    id: "1",
    date: new Date(2024, 11, 20),
    amount: 8500,
    type: "income",
    category: defaultCategories[0],
    description: "Salário dezembro",
  },
  {
    id: "2",
    date: new Date(2024, 11, 19),
    amount: 450,
    type: "expense",
    category: defaultCategories[4],
    description: "Supermercado semanal",
  },
  {
    id: "3",
    date: new Date(2024, 11, 18),
    amount: 1200,
    type: "expense",
    category: defaultCategories[6],
    description: "Aluguel apartamento",
  },
  {
    id: "4",
    date: new Date(2024, 11, 15),
    amount: 2500,
    type: "income",
    category: defaultCategories[1],
    description: "Projeto freelance",
  },
  {
    id: "5",
    date: new Date(2024, 10, 28),
    amount: 180,
    type: "expense",
    category: defaultCategories[5],
    description: "Uber mensal",
  },
];

export default function TransactionListExample() {
  return (
    <TransactionList
      transactions={mockTransactions}
      onEdit={(t) => console.log("Edit:", t)}
      onDelete={(id) => console.log("Delete:", id)}
      onAddNew={() => console.log("Add new")}
    />
  );
}
