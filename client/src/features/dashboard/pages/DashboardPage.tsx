import { useState, useMemo, useEffect } from "react";
import { Plus, Upload, Loader2 } from "lucide-react";
import { startOfMonth, endOfMonth, isWithinInterval, format, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/shared/components/ui/button";
import { SummaryCard } from "@/features/dashboard/components/SummaryCard";
import { TransactionList } from "@/features/transactions/components/TransactionList";
import { TransactionModal } from "@/features/transactions/components/TransactionModal";
import { IncomeExpenseChart } from "@/features/dashboard/components/IncomeExpenseChart";
import { CategoryPieChart } from "@/features/dashboard/components/CategoryPieChart";
import { MonthCalendar } from "@/features/dashboard/components/MonthCalendar";
import { MonthlyOverview } from "@/features/dashboard/components/MonthlyOverview";
import { FamilySpendingCard } from "@/features/dashboard/components/FamilySpendingCard";
import type { Transaction } from "@/features/transactions/components/TransactionItem";
import type { Category } from "@/features/categories/components/CategoryBadge";
import { CircleDot } from "lucide-react";
import { apiRequest, queryClient } from "@/shared/lib/queryClient";
import { getIconByName } from "@/shared/lib/iconMap";
import { useToast } from "@/shared/hooks/use-toast";
import { logger } from '@/shared/lib/logger';

interface ApiTransaction {
  id: string;
  date: string;
  amount: number;
  type: "income" | "expense";
  categoryId: string;
  description: string;
  mode?: string;
  installmentNumber?: number | null;
  installmentsTotal?: number | null;
  cardId?: string | null;
}

interface ApiCategory {
  id: string;
  name: string;
  type: "income" | "expense";
  color: string;
  icon: string | null;
}

export default function Dashboard() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [hasInitializedMonth, setHasInitializedMonth] = useState(false);
  const { toast } = useToast();

  const { data: apiTransactions = [], isLoading: loadingTransactions } = useQuery<ApiTransaction[]>({
    queryKey: ["/api/transactions"],
  });

  // ✨ Detectar mês da transação mais recente quando carregar
  useEffect(() => {
    if (!hasInitializedMonth && apiTransactions.length > 0) {
      const sortedTransactions = [...apiTransactions].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setSelectedMonth(new Date(sortedTransactions[0].date));
      setHasInitializedMonth(true);
    }
  }, [apiTransactions.length, hasInitializedMonth]);

  const { data: apiCategories = [], isLoading: loadingCategories } = useQuery<ApiCategory[]>({
    queryKey: ["/api/categories"],
  });

  const categoriesList = useMemo(() => {
    return apiCategories.map((c) => ({
      id: c.id,
      name: c.name,
      type: c.type,
      color: c.color,
      icon: getIconByName(c.icon || 'circle-dot'),
    }));
  }, [apiCategories]);

  const categoriesMap = useMemo(() => {
    const map = new Map<string, Category>();
    categoriesList.forEach((c) => {
      map.set(c.id, c);
    });
    return map;
  }, [categoriesList]);

  const transactions: Transaction[] = useMemo(() => {
    return apiTransactions.map((t) => ({
      id: t.id,
      date: new Date(t.date),
      amount: t.amount,
      type: t.type,
      category: categoriesMap.get(t.categoryId) || { id: t.categoryId, name: "Outros", type: t.type, color: "#6b7280", icon: CircleDot },
      description: t.description,
      mode: t.mode as "avulsa" | "parcelada" | undefined,
      installmentNumber: t.installmentNumber ?? undefined,
      installmentsTotal: t.installmentsTotal ?? undefined,
      cardId: t.cardId ?? undefined,
    }));
  }, [apiTransactions, categoriesMap]);

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

  const chartData = useMemo(() => {
    const months: { month: string; income: number; expense: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const start = startOfMonth(date);
      const end = endOfMonth(date);
      const monthTxs = transactions.filter((t) => isWithinInterval(t.date, { start, end }));
      months.push({
        month: format(date, "MMM", { locale: ptBR }),
        income: monthTxs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0),
        expense: monthTxs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0),
      });
    }
    return months;
  }, [transactions]);

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

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/transactions", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      toast({ title: "Sucesso", description: "Transacao criada com sucesso" });
    },
    onError: () => {
      toast({ title: "Erro", description: "Falha ao criar transacao", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest("PATCH", `/api/transactions/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      toast({ title: "Sucesso", description: "Transacao atualizada" });
    },
    onError: () => {
      toast({ title: "Erro", description: "Falha ao atualizar", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/transactions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      toast({ title: "Sucesso", description: "Transacao removida" });
    },
    onError: () => {
      toast({ title: "Erro", description: "Falha ao remover", variant: "destructive" });
    },
  });

  const handleSave = (data: any) => {
    if (editingTransaction) {
      updateMutation.mutate({ id: editingTransaction.id, data });
    } else {
      createMutation.mutate(data);
    }
    setEditingTransaction(null);
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const isLoading = loadingTransactions || loadingCategories;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe suas financas em um so lugar
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
            Nova Transacao
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard type="income" value={totalIncome} label="Receitas" />
        <SummaryCard type="expense" value={totalExpense} label="Despesas" />
        <SummaryCard type="balance" value={balance} label="Saldo" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <IncomeExpenseChart data={chartData} />
        <MonthlyOverview
          month={selectedMonth}
          transactions={transactions}
          onDayClick={(date, dayTransactions) => {
            logger.debug("Day clicked:", format(date, "dd/MM/yyyy"), dayTransactions);
          }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryPieChart data={categoryData} />
        <FamilySpendingCard />
      </div>

      <div>
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className="text-lg font-semibold">
            Transacoes de {format(selectedMonth, "MMMM", { locale: ptBR })}
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

      <TransactionModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setEditingTransaction(null);
        }}
        transaction={editingTransaction}
        categories={categoriesList}
        onSave={handleSave}
      />
    </div>
  );
}
