import { useState } from "react";
import { ChevronDown, ChevronRight, Pencil, Trash2, Plus } from "lucide-react";
import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";
import type { Category } from "./CategoryBadge";

interface CategoryGroupProps {
  parentCategory: Category;
  subcategories: Category[];
  onEdit?: (category: Category) => void;
  onDelete?: (id: string) => void;
  onAddSubcategory?: (parentId: string) => void;
  defaultExpanded?: boolean;
}

export function CategoryGroup({
  parentCategory,
  subcategories,
  onEdit,
  onDelete,
  onAddSubcategory,
  defaultExpanded = false,
}: CategoryGroupProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const ParentIcon = parentCategory.icon;

  return (
    <div className="space-y-2">
      {/* Categoria Pai - Header do Acordeão */}
      <Card
        className={cn(
          "p-4 cursor-pointer transition-all hover:bg-accent/50",
          isExpanded && "bg-accent/30"
        )}
        onClick={() => setIsExpanded(!isExpanded)}
        data-testid={`card-parent-category-${parentCategory.id}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Ícone de expansão */}
            <div className="text-muted-foreground">
              {isExpanded ? (
                <ChevronDown className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </div>

            {/* Ícone da categoria */}
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${parentCategory.color}20` }}
            >
              <ParentIcon className="w-6 h-6" style={{ color: parentCategory.color }} />
            </div>

            {/* Info da categoria */}
            <div>
              <p className="font-semibold text-lg">{parentCategory.name}</p>
              <p className="text-sm text-muted-foreground">
                {subcategories.length} {subcategories.length === 1 ? "subcategoria" : "subcategorias"}
              </p>
            </div>
          </div>

          {/* Badge de tipo */}
          <Badge
            variant="outline"
            className="text-xs"
            style={{
              borderColor: parentCategory.color,
              color: parentCategory.color,
            }}
          >
            {parentCategory.type === "income" ? "Receita" : "Despesa"}
          </Badge>
        </div>
      </Card>

      {/* Subcategorias - Conteúdo do Acordeão */}
      {isExpanded && (
        <div className="ml-6 pl-4 border-l-2 border-muted space-y-2">
          {subcategories.map((subcategory) => (
            <SubcategoryCard
              key={subcategory.id}
              category={subcategory}
              parentColor={parentCategory.color}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}

          {/* Botão para adicionar nova subcategoria */}
          {onAddSubcategory && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation();
                onAddSubcategory(parentCategory.id);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar subcategoria
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

interface SubcategoryCardProps {
  category: Category;
  parentColor: string;
  onEdit?: (category: Category) => void;
  onDelete?: (id: string) => void;
}

function SubcategoryCard({
  category,
  parentColor,
  onEdit,
  onDelete,
}: SubcategoryCardProps) {
  const Icon = category.icon;

  return (
    <Card
      className="group p-3 flex items-center justify-between gap-3 hover:bg-accent/50 transition-colors"
      data-testid={`card-subcategory-${category.id}`}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${category.color}20` }}
        >
          <Icon className="w-4 h-4" style={{ color: category.color }} />
        </div>
        <div>
          <p className="font-medium text-sm">{category.name}</p>
          {category.description && (
            <p className="text-xs text-muted-foreground line-clamp-1">
              {category.description}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.(category);
          }}
          data-testid={`button-edit-subcategory-${category.id}`}
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.(category.id);
          }}
          data-testid={`button-delete-subcategory-${category.id}`}
        >
          <Trash2 className="h-3.5 w-3.5 text-destructive" />
        </Button>
      </div>
    </Card>
  );
}

// Componente para categorias órfãs (sem pai definido ou categorias customizadas)
interface OrphanCategoryCardProps {
  category: Category;
  onEdit?: (category: Category) => void;
  onDelete?: (id: string) => void;
}

export function OrphanCategoryCard({
  category,
  onEdit,
  onDelete,
}: OrphanCategoryCardProps) {
  const Icon = category.icon;

  return (
    <Card
      className="group p-4 flex items-center justify-between gap-4 hover:bg-accent/50 transition-colors"
      data-testid={`card-category-${category.id}`}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${category.color}20` }}
        >
          <Icon className="w-5 h-5" style={{ color: category.color }} />
        </div>
        <div>
          <p className="font-medium">{category.name}</p>
          {category.description && (
            <p className="text-xs text-muted-foreground line-clamp-1">
              {category.description}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="text-xs">
          {category.type === "income" ? "Receita" : "Despesa"}
        </Badge>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit?.(category)}
            data-testid={`button-edit-category-${category.id}`}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete?.(category.id)}
            data-testid={`button-delete-category-${category.id}`}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
