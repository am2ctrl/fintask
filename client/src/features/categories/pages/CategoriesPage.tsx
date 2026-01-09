import { useState, useMemo } from "react";
import { flushSync } from "react-dom";
import { Plus, type LucideIcon } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { CategoryGroup, OrphanCategoryCard } from "@/features/categories/components/CategoryGroup";
import { CategoryModal, getIconIdFromComponent, getIconById } from "@/features/categories/components/CategoryModal";
import { type Category } from "@/features/categories/components/CategoryBadge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/shared/hooks/use-toast";
import { apiRequest } from "@/shared/lib/queryClient";

interface CategoryWithParent extends Category {
  parentId?: string | null;
}

interface GroupedCategories {
  parent: CategoryWithParent;
  children: CategoryWithParent[];
}

export default function Categories() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [activeTab, setActiveTab] = useState<"income" | "expense">("expense");
  const [parentIdForNew, setParentIdForNew] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Buscar categorias do banco e converter ícones de string para componentes
  const { data: categoriesRaw } = useQuery<any[]>({
    queryKey: ["/api/categories"],
  });

  const categories: CategoryWithParent[] = useMemo(() => {
    return (categoriesRaw || []).map((cat) => ({
      ...cat,
      icon: typeof cat.icon === "string" ? getIconById(cat.icon.toLowerCase()) : cat.icon,
      parentId: cat.parentId || null,
    }));
  }, [categoriesRaw]);

  // Agrupar categorias por pai
  const groupedCategories = useMemo(() => {
    const incomeGroups: GroupedCategories[] = [];
    const expenseGroups: GroupedCategories[] = [];
    const orphanIncome: CategoryWithParent[] = [];
    const orphanExpense: CategoryWithParent[] = [];

    // Encontrar categorias pai (parentId === null)
    const parentCategories = categories.filter((c) => c.parentId === null || c.parentId === undefined);

    // Encontrar subcategorias
    const subcategories = categories.filter((c) => c.parentId !== null && c.parentId !== undefined);

    // Agrupar
    parentCategories.forEach((parent) => {
      const children = subcategories.filter((sub) => sub.parentId === parent.id);

      const group: GroupedCategories = { parent, children };

      if (parent.type === "income") {
        incomeGroups.push(group);
      } else {
        expenseGroups.push(group);
      }
    });

    // Categorias órfãs (subcategorias sem pai válido encontrado)
    subcategories.forEach((sub) => {
      const hasParent = parentCategories.some((p) => p.id === sub.parentId);
      if (!hasParent) {
        if (sub.type === "income") {
          orphanIncome.push(sub);
        } else {
          orphanExpense.push(sub);
        }
      }
    });

    return {
      income: { groups: incomeGroups, orphans: orphanIncome },
      expense: { groups: expenseGroups, orphans: orphanExpense },
    };
  }, [categories]);

  // Contagem de categorias por tipo
  const incomeCount = categories.filter((c) => c.type === "income").length;
  const expenseCount = categories.filter((c) => c.type === "expense").length;

  // Mutation para criar categoria
  const createMutation = useMutation({
    mutationFn: async (data: { name: string; color: string; type: "income" | "expense"; icon: string; parentId?: string | null }) => {
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

  const handleSave = (data: { name: string; color: string; type: "income" | "expense"; icon: LucideIcon; parentId?: string | null }) => {
    const iconId = getIconIdFromComponent(data.icon);

    console.log("[DEBUG handleSave] data recebida:", data);
    console.log("[DEBUG handleSave] data.parentId:", data.parentId);
    console.log("[DEBUG handleSave] parentIdForNew atual:", parentIdForNew);

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
      const payload = {
        name: data.name,
        type: data.type,
        color: data.color,
        icon: iconId,
        parentId: data.parentId || null,
      };
      console.log("[DEBUG handleSave] payload para createMutation:", payload);
      createMutation.mutate(payload);
    }
    setEditingCategory(null);
    setParentIdForNew(null);
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
    setParentIdForNew(null);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleAddNew = () => {
    setEditingCategory(null);
    setParentIdForNew(null);
    setModalOpen(true);
  };

  const handleAddSubcategory = (parentId: string) => {
    console.log("[DEBUG handleAddSubcategory] parentId recebido:", parentId);
    // Usar flushSync para garantir que o parentId seja atualizado antes de abrir o modal
    flushSync(() => {
      setEditingCategory(null);
      setParentIdForNew(parentId);
    });
    console.log("[DEBUG handleAddSubcategory] após flushSync, abrindo modal");
    setModalOpen(true);
  };

  const renderCategoryGroups = (type: "income" | "expense") => {
    const { groups, orphans } = groupedCategories[type];

    if (groups.length === 0 && orphans.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <p>Nenhuma categoria de {type === "income" ? "receita" : "despesa"} encontrada</p>
          <Button variant="ghost" onClick={handleAddNew} className="mt-2">
            Criar primeira categoria
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Grupos hierárquicos */}
        {groups.map((group) => (
          <CategoryGroup
            key={group.parent.id}
            parentCategory={group.parent}
            subcategories={group.children}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAddSubcategory={handleAddSubcategory}
            defaultExpanded={false}
          />
        ))}

        {/* Categorias órfãs (customizadas pelo usuário sem hierarquia) */}
        {orphans.length > 0 && (
          <div className="mt-6">
            <p className="text-sm text-muted-foreground mb-3 font-medium">
              Categorias Personalizadas
            </p>
            <div className="space-y-2">
              {orphans.map((category) => (
                <OrphanCategoryCard
                  key={category.id}
                  category={category}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Categorias</h1>
          <p className="text-sm text-muted-foreground">
            Organize suas transações com categorias e subcategorias
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
            Despesas ({expenseCount})
          </TabsTrigger>
          <TabsTrigger value="income" data-testid="tab-income">
            Receitas ({incomeCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="expense" className="mt-6">
          {renderCategoryGroups("expense")}
        </TabsContent>

        <TabsContent value="income" className="mt-6">
          {renderCategoryGroups("income")}
        </TabsContent>
      </Tabs>

      <CategoryModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) {
            setEditingCategory(null);
            setParentIdForNew(null);
          }
        }}
        category={editingCategory}
        type={activeTab}
        parentId={parentIdForNew}
        onSave={handleSave}
      />
    </div>
  );
}
