import { useState, useMemo } from "react";
import { Plus, Upload } from "lucide-react";
import { startOfMonth, endOfMonth, isWithinInterval, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { SummaryCard } from "@/components/SummaryCard";
import { TransactionList } from "@/components/TransactionList";
import { TransactionModal } from "@/components/TransactionModal";
import { IncomeExpenseChart } from "@/components/IncomeExpenseChart";
import { CategoryPieChart } from "@/components/CategoryPieChart";
import { MonthCalendar } from "@/components/MonthCalendar";
import { MonthlyOverview } from "@/components/MonthlyOverview";
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
  {
    id: "7",
    date: new Date(2024, 11, 5),
    amount: 520,
    type: "expense",
    category: defaultCategories[4],
    description: "Supermercado mensal",
  },
  {
    id: "8",
    date: new Date(2024, 10, 25),
    amount: 8500,
    type: "income",
    category: defaultCategories[0],
    description: "Salário novembro",
  },
  {
    id: "9",
    date: new Date(2024, 10, 20),
    amount: 1200,
    type: "expense",
    category: defaultCategories[6],
    description: "Aluguel novembro",
  },
  {
    id: "10",
    date: new Date(2024, 10, 15),
    amount: 680,
    type: "expense",
    category: defaultCategories[4],
    description: "Supermercado novembro",
  },
];

const mockChartData = [
  { month: "Jul", income: 6500, expense: 4200 },
  { month: "Ago", income: 7200, expense: 5100 },
  { month: "Set", income: 8000, expense: 4800 },
  { month: "Out", income: 7500, expense: 5500 },
  { month: "Nov", income: 8500, expense: 5000 },
  { month: "Dez", income: 11000, expense: 5200 },
];

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const monthInterval = useMemo(() => ({
    start: startOfMonth(selectedMonth),
    end: endOfMonth(selectedMonth),
  }), [selectedMonth]);

  const monthTransactions = useMemo(() => {
    return transactions.filter((t) =>
      isWithinInterval(t.date, monthInterval)
    );
  }, [transactions, monthInterval]);

  const totalIncome = monthTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = monthTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const categoryData = useMemo(() => {
    const expensesByCategory = new Map<string, { name: string; value: number; color: string }>();
    
    monthTransactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        const existing = expensesByCategory.get(t.category.id);
        if (existing) {
          existing.value += t.amount;
        } else {
          expensesByCategory.set(t.category.id, {
            name: t.category.name,
            value: t.amount,
            color: t.category.color,
          });
        }
      });

    return Array.from(expensesByCategory.values())
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [monthTransactions]);

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
        <div className="flex items-center gap-2">
          <MonthCalendar
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
          />
          <Button asChild variant="outline">
            <Link href="/importar" data-testid="link-import">
              <Upload className="h-4 w-4 mr-2" />
              Importar
            </Link>
          </Button>
          <Button onClick={() => setModalOpen(true)} data-testid="button-new-transaction">
            <Plus className="h-4 w-4 mr-2" />
            Nova Transação
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard type="income" value={totalIncome} trend={12.5} label="Receitas" />
        <SummaryCard type="expense" value={totalExpense} trend={-3.2} label="Despesas" />
        <SummaryCard type="balance" value={balance} trend={25.8} label="Saldo" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <IncomeExpenseChart data={mockChartData} />
        <MonthlyOverview
          month={selectedMonth}
          transactions={transactions}
          onDayClick={(date, dayTransactions) => {
            console.log("Day clicked:", format(date, "dd/MM/yyyy"), dayTransactions);
          }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryPieChart data={categoryData} />
        <div>
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="text-lg font-semibold">
              Transações de {format(selectedMonth, "MMMM", { locale: ptBR })}
            </h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/transacoes" data-testid="link-view-all">Ver todas</Link>
            </Button>
          </div>
          <TransactionList
            transactions={monthTransactions}
            maxItems={5}
            showHeader={false}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAddNew={() => setModalOpen(true)}
          />
        </div>
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
