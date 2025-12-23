import { Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Category } from "./CategoryBadge";

interface CategoryCardProps {
  category: Category;
  transactionCount?: number;
  onEdit?: (category: Category) => void;
  onDelete?: (id: string) => void;
}

export function CategoryCard({
  category,
  transactionCount = 0,
  onEdit,
  onDelete,
}: CategoryCardProps) {
  return (
    <Card
      className="group p-4 flex items-center justify-between gap-4"
      data-testid={`card-category-${category.id}`}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${category.color}20` }}
        >
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: category.color }}
          />
        </div>
        <div>
          <p className="font-medium">{category.name}</p>
          <p className="text-xs text-muted-foreground">
            {transactionCount} {transactionCount === 1 ? "transação" : "transações"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="text-xs">
          {category.type === "income" ? "Receita" : "Despesa"}
        </Badge>
        <div className="flex items-center gap-1 invisible group-hover:visible">
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
