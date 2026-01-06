import { useState } from "react";
import { Plus, CircleDot, type LucideIcon } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { CategoryCard } from "@/features/categories/components/CategoryCard";
import { CategoryModal, getIconIdFromComponent, getIconById } from "@/features/categories/components/CategoryModal";
import { defaultCategories, type Category } from "@/features/categories/components/CategoryBadge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/shared/hooks/use-toast";
import { apiRequest } from "@/shared/lib/queryClient";

export default function Categories() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [activeTab, setActiveTab] = useState<"income" | "expense">("expense");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Buscar categorias do banco e converter ícones de string para componentes
  const { data: categoriesRaw } = useQuery<any[]>({
    queryKey: ["/api/categories"],
  });

  const categories: Category[] = (categoriesRaw || []).map((cat) => ({
    ...cat,
    icon: typeof cat.icon === "string" ? getIconById(cat.icon.toLowerCase()) : cat.icon,
  }));

  const incomeCategories = categories.filter((c) => c.type === "income");
  const expenseCategories = categories.filter((c) => c.type === "expense");

  // Mutation para criar categoria
  const createMutation = useMutation({
    mutationFn: async (data: { name: string; color: string; type: "income" | "expense"; icon: string }) => {
      const response = await apiRequest("POST", "/api/categories", data);

      if (!response.ok) {
        throw new Error("Falha ao criar categoria");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Categoria criada com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar categoria",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation para atualizar categoria
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { name: string; color: string; icon: string } }) => {
      const response = await apiRequest("PATCH", `/api/categories/${id}`, data);

      if (!response.ok) {
        throw new Error("Falha ao atualizar categoria");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Categoria atualizada com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar categoria",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSave = (data: { name: string; color: string; type: "income" | "expense"; icon: LucideIcon }) => {
    const iconId = getIconIdFromComponent(data.icon);

    if (editingCategory) {
      updateMutation.mutate({
        id: editingCategory.id,
        data: {
          name: data.name,
          color: data.color,
          icon: iconId,
        },
      });
    } else {
      createMutation.mutate({
        name: data.name,
        type: data.type,
        color: data.color,
        icon: iconId,
      });
    }
    setEditingCategory(null);
  };

  // Mutation para deletar categoria
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/categories/${id}`);

      if (!response.ok) {
        throw new Error("Falha ao deletar categoria");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Categoria deletada com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao deletar categoria",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setActiveTab(category.type);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
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
