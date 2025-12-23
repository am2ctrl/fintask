import { Badge } from "@/components/ui/badge";

export interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
  color: string;
}

interface CategoryBadgeProps {
  category: Category;
  size?: "sm" | "default";
}

export function CategoryBadge({ category, size = "default" }: CategoryBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={`${size === "sm" ? "text-xs px-2 py-0.5" : ""}`}
      style={{ 
        backgroundColor: `${category.color}20`,
        color: category.color,
        borderColor: `${category.color}40`
      }}
      data-testid={`badge-category-${category.id}`}
    >
      {category.name}
    </Badge>
  );
}

// todo: remove mock data - default categories
export const defaultCategories: Category[] = [
  { id: "1", name: "Salário", type: "income", color: "#22c55e" },
  { id: "2", name: "Freelance", type: "income", color: "#10b981" },
  { id: "3", name: "Investimentos", type: "income", color: "#14b8a6" },
  { id: "4", name: "Outros", type: "income", color: "#06b6d4" },
  { id: "5", name: "Alimentação", type: "expense", color: "#f97316" },
  { id: "6", name: "Transporte", type: "expense", color: "#eab308" },
  { id: "7", name: "Moradia", type: "expense", color: "#ef4444" },
  { id: "8", name: "Saúde", type: "expense", color: "#ec4899" },
  { id: "9", name: "Educação", type: "expense", color: "#8b5cf6" },
  { id: "10", name: "Lazer", type: "expense", color: "#6366f1" },
  { id: "11", name: "Contas", type: "expense", color: "#0ea5e9" },
  { id: "12", name: "Compras", type: "expense", color: "#84cc16" },
];
