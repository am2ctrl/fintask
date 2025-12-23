import { useState } from "react";
import { Plus, CreditCard as CreditCardIcon, Smartphone, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCardDisplay } from "@/components/CreditCardDisplay";
import { CreditCardModal } from "@/components/CreditCardModal";
import { formatCurrency } from "@/components/SummaryCard";
import type { CreditCardData } from "@/components/CreditCardTypes";
import { mockCreditCards } from "@/components/CreditCardTypes";

export default function Cards() {
  const [cards, setCards] = useState<CreditCardData[]>(mockCreditCards);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCardData | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "physical" | "virtual">("all");

  // Mock spending data per card
  const cardSpending: Record<string, number> = {
    "1": 4523.50,
    "2": 2150.00,
    "3": 890.75,
  };

  // Calculate spending per holder
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

  const handleSave = (data: Omit<CreditCardData, "id">) => {
    if (editingCard) {
      setCards((prev) =>
        prev.map((c) =>
          c.id === editingCard.id ? { ...c, ...data } : c
        )
      );
    } else {
      const newCard: CreditCardData = {
        id: Date.now().toString(),
        ...data,
      };
      setCards((prev) => [...prev, newCard]);
    }
    setEditingCard(null);
  };

  const handleEdit = (card: CreditCardData) => {
    setEditingCard(card);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
  };

  const handleAddNew = () => {
    setEditingCard(null);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Cartões de Crédito</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie seus cartões físicos e virtuais
          </p>
        </div>
        <Button onClick={handleAddNew} data-testid="button-new-card">
          <Plus className="h-4 w-4 mr-2" />
          Novo Cartão
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/10">
              <CreditCardIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de Cartões</p>
              <p className="text-2xl font-semibold font-mono">{cards.length}</p>
              <p className="text-xs text-muted-foreground">
                {physicalCards.length} físicos, {virtualCards.length} virtuais
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
                Usado: {formatCurrency(totalSpent)} ({((totalSpent / totalLimit) * 100).toFixed(0)}%)
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
            Físicos ({physicalCards.length})
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
              <p>Nenhum cartão encontrado</p>
              <Button variant="ghost" onClick={handleAddNew} className="mt-2">
                Adicionar primeiro cartão
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Spending by Holder Section */}
      <Card className="p-5">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Gastos por Membro da Família
        </h3>
        <div className="space-y-4">
          {Object.entries(spendingByHolder)
            .sort(([, a], [, b]) => b - a)
            .map(([holder, amount]) => {
              const percent = (amount / totalSpent) * 100;
              const holderCards = cards.filter(c => c.holder === holder);
              
              return (
                <div key={holder} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{holder}</span>
                      <span className="text-xs text-muted-foreground">
                        ({holderCards.length} {holderCards.length === 1 ? "cartão" : "cartões"})
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
