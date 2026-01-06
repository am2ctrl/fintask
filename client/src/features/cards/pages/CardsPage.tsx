import { useState, useMemo } from "react";
import { Plus, CreditCard as CreditCardIcon, Smartphone, Users, Loader2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { CreditCardDisplay } from "@/features/cards/components/CreditCardDisplay";
import { CreditCardModal } from "@/features/cards/components/CreditCardModal";
import { formatCurrency } from "@/features/dashboard/components/SummaryCard";
import type { CreditCardData } from "@/features/cards/components/CreditCardTypes";
import { cardPurposes } from "@/features/cards/components/CreditCardTypes";
import { apiRequest, queryClient } from "@/shared/lib/queryClient";
import { useToast } from "@/shared/hooks/use-toast";

interface ApiCreditCard {
  id: string;
  name: string;
  lastFourDigits: string;
  cardType: "physical" | "virtual";
  holder: string;
  purpose: string;
  color: string;
  icon: string;
  limit: number | null;
  closingDay: number | null;
  dueDay: number | null;
  holderFamilyMemberId: string | null;
}

interface ApiTransaction {
  id: string;
  cardId: string | null;
  amount: number;
  type: "income" | "expense";
}

export default function Cards() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCardData | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "physical" | "virtual">("all");
  const { toast } = useToast();

  const { data: apiCards = [], isLoading: loadingCards } = useQuery<ApiCreditCard[]>({
    queryKey: ["/api/credit-cards"],
  });

  const { data: apiTransactions = [], isLoading: loadingTransactions } = useQuery<ApiTransaction[]>({
    queryKey: ["/api/transactions"],
  });

  const cards: CreditCardData[] = useMemo(() => {
    return apiCards.map((c) => {
      const purposeObj = cardPurposes.find((p) => p.id === c.purpose || p.label === c.purpose);
      return {
        id: c.id,
        name: c.name,
        lastFourDigits: c.lastFourDigits,
        type: c.cardType,
        holder: c.holder,
        purpose: c.purpose,
        color: c.color,
        icon: purposeObj?.icon || CreditCardIcon,
        limit: c.limit || undefined,
        closingDay: c.closingDay || undefined,
        dueDay: c.dueDay || undefined,
        holderFamilyMemberId: c.holderFamilyMemberId || undefined,
      };
    });
  }, [apiCards]);

  const cardSpending = useMemo(() => {
    const spending: Record<string, number> = {};
    apiTransactions
      .filter((t) => t.cardId && t.type === "expense")
      .forEach((t) => {
        spending[t.cardId!] = (spending[t.cardId!] || 0) + t.amount;
      });
    return spending;
  }, [apiTransactions]);

  const spendingByHolder = cards.reduce((acc, card) => {
    const spent = cardSpending[card.id] || 0;
    acc[card.holder] = (acc[card.holder] || 0) + spent;
    return acc;
  }, {} as Record<string, number>);

  const physicalCards = cards.filter((c) => c.type === "physical");
  const virtualCards = cards.filter((c) => c.type === "virtual");
  const totalLimit = cards.reduce((sum, c) => sum + (c.limit || 0), 0);
  const totalSpent = Object.values(cardSpending).reduce((sum, v) => sum + v, 0);

  const getFilteredCards = () => {
    switch (activeTab) {
      case "physical":
        return physicalCards;
      case "virtual":
        return virtualCards;
      default:
        return cards;
    }
  };

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/credit-cards", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/credit-cards"] });
      toast({ title: "Sucesso", description: "Cartao criado com sucesso" });
    },
    onError: () => {
      toast({ title: "Erro", description: "Falha ao criar cartao", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest("PATCH", `/api/credit-cards/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/credit-cards"] });
      toast({ title: "Sucesso", description: "Cartao atualizado" });
    },
    onError: () => {
      toast({ title: "Erro", description: "Falha ao atualizar", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/credit-cards/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/credit-cards"] });
      toast({ title: "Sucesso", description: "Cartao removido" });
    },
    onError: () => {
      toast({ title: "Erro", description: "Falha ao remover", variant: "destructive" });
    },
  });

  const handleSave = (data: Omit<CreditCardData, "id">) => {
    const apiData = {
      name: data.name,
      lastFourDigits: data.lastFourDigits,
      cardType: data.type,
      holder: data.holder,
      purpose: data.purpose,
      color: data.color,
      icon: data.purpose,
      limit: data.limit || null,
      closingDay: data.closingDay || null,
      dueDay: data.dueDay || null,
      holderFamilyMemberId: data.holderFamilyMemberId || null,
    };

    if (editingCard) {
      updateMutation.mutate({ id: editingCard.id, data: apiData });
    } else {
      createMutation.mutate(apiData);
    }
    setEditingCard(null);
  };

  const handleEdit = (card: CreditCardData) => {
    setEditingCard(card);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleAddNew = () => {
    setEditingCard(null);
    setModalOpen(true);
  };

  const isLoading = loadingCards || loadingTransactions;

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
          <h1 className="text-2xl font-semibold">Cartoes de Credito</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie seus cartoes fisicos e virtuais
          </p>
        </div>
        <Button onClick={handleAddNew} data-testid="button-new-card">
          <Plus className="h-4 w-4 mr-2" />
          Novo Cartao
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/10">
              <CreditCardIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de Cartoes</p>
              <p className="text-2xl font-semibold font-mono">{cards.length}</p>
              <p className="text-xs text-muted-foreground">
                {physicalCards.length} fisicos, {virtualCards.length} virtuais
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-chart-2/10">
              <Smartphone className="w-5 h-5 text-chart-2" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Limite Total</p>
              <p className="text-2xl font-semibold font-mono text-chart-2">
                {formatCurrency(totalLimit)}
              </p>
              <p className="text-xs text-muted-foreground">
                Usado: {formatCurrency(totalSpent)} {totalLimit > 0 ? `(${((totalSpent / totalLimit) * 100).toFixed(0)}%)` : ""}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-chart-3/10">
              <Users className="w-5 h-5 text-chart-3" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Por Titular</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {Object.entries(spendingByHolder).map(([holder, amount]) => (
                  <span key={holder} className="text-xs bg-muted px-2 py-1 rounded">
                    {holder}: <span className="font-mono">{formatCurrency(amount)}</span>
                  </span>
                ))}
                {Object.keys(spendingByHolder).length === 0 && (
                  <span className="text-xs text-muted-foreground">Nenhum gasto registrado</span>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "all" | "physical" | "virtual")}>
        <TabsList>
          <TabsTrigger value="all" data-testid="tab-all-cards">
            Todos ({cards.length})
          </TabsTrigger>
          <TabsTrigger value="physical" data-testid="tab-physical">
            <CreditCardIcon className="w-4 h-4 mr-1" />
            Fisicos ({physicalCards.length})
          </TabsTrigger>
          <TabsTrigger value="virtual" data-testid="tab-virtual">
            <Smartphone className="w-4 h-4 mr-1" />
            Virtuais ({virtualCards.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {getFilteredCards().length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getFilteredCards().map((card) => (
                <CreditCardDisplay
                  key={card.id}
                  card={card}
                  spent={cardSpending[card.id] || 0}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <CreditCardIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum cartao encontrado</p>
              <Button variant="ghost" onClick={handleAddNew} className="mt-2">
                Adicionar primeiro cartao
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {cards.length > 0 && Object.keys(spendingByHolder).length > 0 && (
        <Card className="p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Gastos por Membro da Familia
          </h3>
          <div className="space-y-4">
            {Object.entries(spendingByHolder)
              .sort(([, a], [, b]) => b - a)
              .map(([holder, amount]) => {
                const percent = totalSpent > 0 ? (amount / totalSpent) * 100 : 0;
                const holderCards = cards.filter(c => c.holder === holder);
                
                return (
                  <div key={holder} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{holder}</span>
                        <span className="text-xs text-muted-foreground">
                          ({holderCards.length} {holderCards.length === 1 ? "cartao" : "cartoes"})
                        </span>
                      </div>
                      <span className="font-mono font-semibold">{formatCurrency(amount)}</span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {holderCards.map(card => (
                        <span
                          key={card.id}
                          className="text-xs px-2 py-0.5 rounded"
                          style={{ backgroundColor: `${card.color}20`, color: card.color }}
                        >
                          {card.name}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        </Card>
      )}

      <CreditCardModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setEditingCard(null);
        }}
        card={editingCard}
        onSave={handleSave}
      />
    </div>
  );
}
