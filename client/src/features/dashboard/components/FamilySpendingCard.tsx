import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card } from "@/shared/components/ui/card";
import { Users, TrendingUp, User, ChevronRight } from "lucide-react";
import { formatCurrency } from "./SummaryCard";
import type { ApiFamilyMember, ApiTransaction } from "@/shared/types/api";

export function FamilySpendingCard() {
  const [, setLocation] = useLocation();

  const { data: familyMembers = [] } = useQuery<ApiFamilyMember[]>({
    queryKey: ["/api/family-members"],
  });

  const { data: transactions = [] } = useQuery<ApiTransaction[]>({
    queryKey: ["/api/transactions"],
  });

  const spendingByMember = useMemo(() => {
    const spending: Record<string, { name: string; total: number; count: number }> = {};

    // Gastos de quem NÃO tem family_member_id (usuário principal)
    const mainUserTransactions = transactions.filter(
      (t) => !t.family_member_id && t.type === "expense"
    );
    const mainUserTotal = mainUserTransactions.reduce((sum, t) => sum + t.amount, 0);

    if (mainUserTotal > 0 || mainUserTransactions.length > 0) {
      spending["main"] = {
        name: "Você (Principal)",
        total: mainUserTotal,
        count: mainUserTransactions.length,
      };
    }

    // Gastos por membro da família
    familyMembers.forEach((member) => {
      const memberTransactions = transactions.filter(
        (t) => t.family_member_id === member.id && t.type === "expense"
      );
      const total = memberTransactions.reduce((sum, t) => sum + t.amount, 0);

      if (total > 0 || memberTransactions.length > 0) {
        spending[member.id] = {
          name: member.name,
          total,
          count: memberTransactions.length,
        };
      }
    });

    return spending;
  }, [familyMembers, transactions]);

  const totalSpending = useMemo(() => {
    return Object.values(spendingByMember).reduce((sum, m) => sum + m.total, 0);
  }, [spendingByMember]);

  const membersList = Object.entries(spendingByMember);

  // Não mostrar o card se não houver membros ou gastos
  if (membersList.length === 0) {
    return null;
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20">
          <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Gastos por Membro</h3>
          <p className="text-sm text-muted-foreground">
            Distribuição de despesas na família
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {membersList.map(([id, data]) => {
          const percentage = totalSpending > 0 ? (data.total / totalSpending) * 100 : 0;

          return (
            <div
              key={id}
              className="space-y-2 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group"
              onClick={() => setLocation(`/transacoes?member=${id}`)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{data.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({data.count} {data.count === 1 ? "transação" : "transações"})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(data.total)}</p>
                    <p className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              {/* Barra de progresso */}
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Total */}
      <div className="mt-6 pt-4 border-t">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            <span className="font-semibold">Total Geral</span>
          </div>
          <span className="text-xl font-bold">{formatCurrency(totalSpending)}</span>
        </div>
      </div>
    </Card>
  );
}
