import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { MonthYearNavigator } from "../components/MonthYearNavigator";
import { PaymentFilters } from "../components/PaymentFilters";
import { PaymentSummaryCards } from "../components/PaymentSummaryCards";
import { PaymentTable } from "../components/PaymentTable";
import { PaymentDetailModal } from "../components/PaymentDetailModal";
import type { Transaction } from "@/features/transactions/components/TransactionItem";
import type { Category } from "@/features/categories/components/CategoryBadge";
import { CircleDot, Loader2 } from "lucide-react";
import { apiRequest, queryClient } from "@/shared/lib/queryClient";
import { getIconByName } from "@/shared/lib/iconMap";
import { useToast } from "@/shared/hooks/use-toast";

interface ApiTransaction {
  id: string;
  date: string;
  amount: number;
  type: "income" | "expense";
  categoryId: string;
  name: string;
  description: string | null;
  mode?: string;
  installmentNumber?: number | null;
  installmentsTotal?: number | null;
  cardId?: string | null;
  familyMemberId?: string | null;
  dueDate?: string | null;
  isPaid?: boolean;
  isRecurring?: boolean;
  recurringMonths?: number | null;
}

interface ApiCategory {
  id: string;
  name: string;
  type: "income" | "expense";
  color: string;
  icon: string | null;
}

export default function PaymentControlPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activeTab, setActiveTab] = useState<"pagar" | "receber">("pagar");
  const [selectedPayment, setSelectedPayment] = useState<Transaction | null>(null);
  const [filters, setFilters] = useState({
    search: "",
    accountId: "all",
    statusFilter: "all",
  });
  const { toast } = useToast();

  const { data: apiTransactions = [], isLoading: loadingTransactions } = useQuery<ApiTransaction[]>({
    queryKey: ["/api/transactions"],
  });

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
      category: categoriesMap.get(t.categoryId) || {
        id: t.categoryId,
        name: "Outros",
        type: t.type,
        color: "#6b7280",
        icon: CircleDot
      },
      name: t.name,
      description: t.description,
      mode: t.mode as "avulsa" | "parcelada" | undefined,
      installmentNumber: t.installmentNumber ?? undefined,
      installmentsTotal: t.installmentsTotal ?? undefined,
      dueDate: t.dueDate ? new Date(t.dueDate) : undefined,
      isPaid: t.isPaid ?? false,
      isRecurring: t.isRecurring ?? false,
      recurringMonths: t.recurringMonths ?? undefined,
    } as Transaction));
  }, [apiTransactions, categoriesMap]);

  const filteredPayments = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return transactions
      .filter((t) => {
        // Only transactions with dueDate
        if (!t.dueDate) return false;

        // Filter by month/year
        const dueMonth = t.dueDate.getMonth();
        const dueYear = t.dueDate.getFullYear();
        if (dueMonth !== currentMonth.getMonth() || dueYear !== currentMonth.getFullYear()) {
          return false;
        }

        // Filter by type (tab)
        if (activeTab === "pagar" && t.type !== "expense") return false;
        if (activeTab === "receber" && t.type !== "income") return false;

        // Filter by search
        if (filters.search && !t.name.toLowerCase().includes(filters.search.toLowerCase())) {
          return false;
        }

        // Filter by status
        if (filters.statusFilter === "paid" && !t.isPaid) return false;
        if (filters.statusFilter === "pending" && (t.isPaid || t.dueDate < today)) return false;
        if (filters.statusFilter === "overdue" && (t.isPaid || t.dueDate >= today)) return false;

        return true;
      })
      .sort((a, b) => {
        // Sort by due date ascending (oldest first)
        if (a.dueDate && b.dueDate) {
          return a.dueDate.getTime() - b.dueDate.getTime();
        }
        return 0;
      });
  }, [transactions, currentMonth, activeTab, filters]);

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest("PATCH", `/api/transactions/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      toast({ title: "Sucesso", description: "Pagamento atualizado" });
    },
    onError: () => {
      toast({ title: "Erro", description: "Falha ao atualizar", variant: "destructive" });
    },
  });

  const handleToggleStatus = (transaction: Transaction) => {
    updateMutation.mutate({
      id: transaction.id,
      data: { isPaid: !transaction.isPaid },
    });
  };

  const handleSavePayment = (data: any) => {
    // Future: implement update logic
    setSelectedPayment(null);
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
          <h1 className="text-2xl font-semibold">Controle de Pagamentos</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie contas a pagar e receber
          </p>
        </div>
        <MonthYearNavigator
          currentMonth={currentMonth}
          onMonthChange={setCurrentMonth}
        />
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "pagar" | "receber")}>
        <TabsList>
          <TabsTrigger value="pagar">Contas a Pagar</TabsTrigger>
          <TabsTrigger value="receber">Contas a Receber</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
          <PaymentSummaryCards payments={filteredPayments} />

          <PaymentFilters
            filters={filters}
            onFiltersChange={setFilters}
          />

          <PaymentTable
            payments={filteredPayments}
            onSelectPayment={setSelectedPayment}
            onToggleStatus={handleToggleStatus}
          />
        </TabsContent>
      </Tabs>

      <PaymentDetailModal
        open={!!selectedPayment}
        payment={selectedPayment}
        onOpenChange={(open) => !open && setSelectedPayment(null)}
        onSave={handleSavePayment}
      />
    </div>
  );
}
