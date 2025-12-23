import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SummaryCard } from "@/components/SummaryCard";
import { TransactionList } from "@/components/TransactionList";
import { TransactionModal } from "@/components/TransactionModal";
import { IncomeExpenseChart } from "@/components/IncomeExpenseChart";
import { CategoryPieChart } from "@/components/CategoryPieChart";
import { defaultCategories, type Category } from "@/components/CategoryBadge";
import type { Transaction } from "@/components/TransactionItem";

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
    date: new Date(2024, 11, 12),
    amount: 180,
    type: "expense",
    category: defaultCategories[5],
    description: "Uber mensal",
  },
  {
    id: "6",
    date: new Date(2024, 11, 10),
    amount: 350,
    type: "expense",
    category: defaultCategories[9],
    description: "Cinema e jantar",
  },
];

const mockChartData = [
  { month: "Jul", income: 6500, expense: 4200 },
  { month: "Ago", income: 7200, expense: 5100 },
  { month: "Set", income: 8000, expense: 4800 },
  { month: "Out", income: 7500, expense: 5500 },
  { month: "Nov", income: 8200, expense: 5000 },
  { month: "Dez", income: 11000, expense: 5230 },
];

const mockCategoryData = [
  { name: "Alimentação", value: 1500, color: "#f97316" },
  { name: "Moradia", value: 1200, color: "#ef4444" },
  { name: "Transporte", value: 800, color: "#eab308" },
  { name: "Lazer", value: 600, color: "#6366f1" },
  { name: "Contas", value: 730, color: "#0ea5e9" },
  { name: "Outros", value: 400, color: "#8b5cf6" },
];

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const handleSave = (data: any) => {
    const category = defaultCategories.find((c) => c.id === data.categoryId)!;
    
    if (editingTransaction) {
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === editingTransaction.id
            ? { ...t, ...data, category }
            : t
        )
      );
    } else {
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        date: data.date,
        amount: data.amount,
        type: data.type,
        category,
        description: data.description,
      };
      setTransactions((prev) => [newTransaction, ...prev]);
    }
    setEditingTransaction(null);
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe suas finanças em um só lugar
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)} data-testid="button-new-transaction">
          <Plus className="h-4 w-4 mr-2" />
          Nova Transação
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard type="income" value={totalIncome} trend={12.5} label="Receitas" />
        <SummaryCard type="expense" value={totalExpense} trend={-3.2} label="Despesas" />
        <SummaryCard type="balance" value={balance} trend={25.8} label="Saldo" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <IncomeExpenseChart data={mockChartData} />
        <CategoryPieChart data={mockCategoryData} />
      </div>

      <div>
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className="text-lg font-semibold">Transações Recentes</h2>
          <Button variant="ghost" size="sm" asChild>
            <a href="/transacoes" data-testid="link-view-all">Ver todas</a>
          </Button>
        </div>
        <TransactionList
          transactions={transactions}
          maxItems={5}
          showHeader={false}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAddNew={() => setModalOpen(true)}
        />
      </div>

      <TransactionModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setEditingTransaction(null);
        }}
        transaction={editingTransaction}
        onSave={handleSave}
      />
    </div>
  );
}
