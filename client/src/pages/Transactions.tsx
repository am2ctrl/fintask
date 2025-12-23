import { useState, useMemo } from "react";
import { Plus, Loader2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { TransactionList } from "@/components/TransactionList";
import { TransactionModal } from "@/components/TransactionModal";
import { TransactionFilters, type FilterState } from "@/components/TransactionFilters";
import { formatCurrency } from "@/components/SummaryCard";
import type { Transaction } from "@/components/TransactionItem";
import type { Category } from "@/components/CategoryBadge";
import { CircleDot, Banknote, Briefcase, TrendingUp, Utensils, Car, Home, Heart, GraduationCap, Gamepad2, Receipt, ShoppingBag, type LucideIcon } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

const iconMap: Record<string, LucideIcon> = {
  banknote: Banknote,
  briefcase: Briefcase,
  trendingup: TrendingUp,
  utensils: Utensils,
  car: Car,
  home: Home,
  heart: Heart,
  graduationcap: GraduationCap,
  gamepad2: Gamepad2,
  receipt: Receipt,
  shoppingbag: ShoppingBag,
};
import { useToast } from "@/hooks/use-toast";

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

export default function Transactions() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    type: "all",
    categoryId: "all",
    dateFrom: undefined,
    dateTo: undefined,
  });
  const { toast } = useToast();

  const { data: apiTransactions = [], isLoading: loadingTransactions } = useQuery<ApiTransaction[]>({
    queryKey: ["/api/transactions"],
  });

  const { data: apiCategories = [], isLoading: loadingCategories } = useQuery<ApiCategory[]>({
    queryKey: ["/api/categories"],
  });

  const categoriesMap = useMemo(() => {
    const map = new Map<string, Category>();
    apiCategories.forEach((c) => {
      const iconKey = (c.icon || "").toLowerCase().replace(/[^a-z0-9]/g, "");
      map.set(c.id, { 
        id: c.id, 
        name: c.name, 
        type: c.type, 
        color: c.color,
        icon: iconMap[iconKey] || CircleDot,
      });
    });
    return map;
  }, [apiCategories]);

  const transactions: Transaction[] = useMemo(() => {
    return apiTransactions.map((t) => ({
      id: t.id,
      date: new Date(t.date),
      amount: t.amount,
      type: t.type,
      category: categoriesMap.get(t.categoryId) || { id: t.categoryId, name: "Outros", type: t.type, color: "#6b7280", icon: CircleDot },
      description: t.description,
      mode: t.mode as "avulsa" | "recorrente" | "parcelada" | undefined,
      installmentNumber: t.installmentNumber ?? undefined,
      installmentsTotal: t.installmentsTotal ?? undefined,
      cardId: t.cardId ?? undefined,
    }));
  }, [apiTransactions, categoriesMap]);

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
          <h1 className="text-2xl font-semibold">Transacoes</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie todas as suas transacoes
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)} data-testid="button-new-transaction">
          <Plus className="h-4 w-4 mr-2" />
          Nova Transacao
        </Button>
      </div>

      <TransactionFilters filters={filters} onFiltersChange={setFilters} />

      <div className="flex items-center justify-between gap-4 text-sm">
        <span className="text-muted-foreground">
          {filteredTransactions.length} transacoes encontradas
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
