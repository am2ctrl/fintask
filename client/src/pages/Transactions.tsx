import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TransactionList } from "@/components/TransactionList";
import { TransactionModal } from "@/components/TransactionModal";
import { TransactionFilters, type FilterState } from "@/components/TransactionFilters";
import { defaultCategories } from "@/components/CategoryBadge";
import type { Transaction } from "@/components/TransactionItem";
import { formatCurrency } from "@/components/SummaryCard";

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
    date: new Date(2024, 10, 28),
    amount: 8500,
    type: "income",
    category: defaultCategories[0],
    description: "Salário novembro",
  },
  {
    id: "8",
    date: new Date(2024, 10, 25),
    amount: 520,
    type: "expense",
    category: defaultCategories[4],
    description: "Supermercado mensal",
  },
  {
    id: "9",
    date: new Date(2024, 10, 20),
    amount: 1200,
    type: "expense",
    category: defaultCategories[6],
    description: "Aluguel apartamento",
  },
  {
    id: "10",
    date: new Date(2024, 10, 15),
    amount: 200,
    type: "expense",
    category: defaultCategories[7],
    description: "Consulta médica",
  },
];

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    type: "all",
    categoryId: "all",
    dateFrom: undefined,
    dateTo: undefined,
  });

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (filters.search && !t.description.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.type !== "all" && t.type !== filters.type) {
        return false;
      }
      if (filters.categoryId !== "all" && t.category.id !== filters.categoryId) {
        return false;
      }
      if (filters.dateFrom && t.date < filters.dateFrom) {
        return false;
      }
      if (filters.dateTo && t.date > filters.dateTo) {
        return false;
      }
      return true;
    });
  }, [transactions, filters]);

  const totalFiltered = filteredTransactions.reduce((acc, t) => {
    return t.type === "income" ? acc + t.amount : acc - t.amount;
  }, 0);

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
          <h1 className="text-2xl font-semibold">Transações</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie todas as suas transações
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)} data-testid="button-new-transaction">
          <Plus className="h-4 w-4 mr-2" />
          Nova Transação
        </Button>
      </div>

      <TransactionFilters filters={filters} onFiltersChange={setFilters} />

      <div className="flex items-center justify-between gap-4 text-sm">
        <span className="text-muted-foreground">
          {filteredTransactions.length} transações encontradas
        </span>
        <span className={`font-mono font-semibold ${totalFiltered >= 0 ? "text-primary" : "text-destructive"}`}>
          Saldo: {formatCurrency(totalFiltered)}
        </span>
      </div>

      <TransactionList
        transactions={filteredTransactions}
        showHeader={false}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAddNew={() => setModalOpen(true)}
      />

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
