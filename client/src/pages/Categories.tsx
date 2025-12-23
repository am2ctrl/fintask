import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoryCard } from "@/components/CategoryCard";
import { CategoryModal } from "@/components/CategoryModal";
import { defaultCategories, type Category } from "@/components/CategoryBadge";

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [activeTab, setActiveTab] = useState<"income" | "expense">("expense");

  const incomeCategories = categories.filter((c) => c.type === "income");
  const expenseCategories = categories.filter((c) => c.type === "expense");

  const handleSave = (data: { name: string; color: string; type: "income" | "expense" }) => {
    if (editingCategory) {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === editingCategory.id
            ? { ...c, name: data.name, color: data.color }
            : c
        )
      );
    } else {
      const newCategory: Category = {
        id: Date.now().toString(),
        name: data.name,
        type: data.type,
        color: data.color,
      };
      setCategories((prev) => [...prev, newCategory]);
    }
    setEditingCategory(null);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setActiveTab(category.type);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const handleAddNew = () => {
    setEditingCategory(null);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Categorias</h1>
          <p className="text-sm text-muted-foreground">
            Organize suas transações com categorias personalizadas
          </p>
        </div>
        <Button onClick={handleAddNew} data-testid="button-new-category">
          <Plus className="h-4 w-4 mr-2" />
          Nova Categoria
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "income" | "expense")}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="expense" data-testid="tab-expense">
            Despesas ({expenseCategories.length})
          </TabsTrigger>
          <TabsTrigger value="income" data-testid="tab-income">
            Receitas ({incomeCategories.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="expense" className="mt-6">
          <div className="grid gap-3">
            {expenseCategories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                transactionCount={Math.floor(Math.random() * 50)}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
            {expenseCategories.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p>Nenhuma categoria de despesa encontrada</p>
                <Button variant="ghost" onClick={handleAddNew}>
                  Criar primeira categoria
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="income" className="mt-6">
          <div className="grid gap-3">
            {incomeCategories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                transactionCount={Math.floor(Math.random() * 20)}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
            {incomeCategories.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p>Nenhuma categoria de receita encontrada</p>
                <Button variant="ghost" onClick={handleAddNew}>
                  Criar primeira categoria
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <CategoryModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setEditingCategory(null);
        }}
        category={editingCategory}
        type={activeTab}
        onSave={handleSave}
      />
    </div>
  );
}
