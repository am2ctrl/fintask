import { Badge } from "@/components/ui/badge";
import { 
  Banknote, 
  Briefcase, 
  TrendingUp, 
  CircleDot,
  Utensils, 
  Car, 
  Home, 
  Heart, 
  GraduationCap, 
  Gamepad2, 
  Receipt, 
  ShoppingBag,
  type LucideIcon
} from "lucide-react";

export interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
  color: string;
  icon: LucideIcon;
}

interface CategoryBadgeProps {
  category: Category;
  size?: "sm" | "default";
  showIcon?: boolean;
}

export function CategoryBadge({ category, size = "default", showIcon = true }: CategoryBadgeProps) {
  const Icon = category.icon;
  
  return (
    <Badge
      variant="secondary"
      className={`gap-1.5 ${size === "sm" ? "text-xs px-2 py-0.5" : ""}`}
      style={{ 
        backgroundColor: `${category.color}20`,
        color: category.color,
        borderColor: `${category.color}40`
      }}
      data-testid={`badge-category-${category.id}`}
    >
      {showIcon && <Icon className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />}
      {category.name}
    </Badge>
  );
}

export function CategoryIcon({ category, size = "default" }: { category: Category; size?: "sm" | "default" }) {
  const Icon = category.icon;
  const sizeClass = size === "sm" ? "w-3 h-3" : "w-4 h-4";
  
  return (
    <div 
      className="flex items-center justify-center rounded-full p-1.5"
      style={{ backgroundColor: `${category.color}20` }}
    >
      <Icon className={sizeClass} style={{ color: category.color }} />
    </div>
  );
}

// Default categories with icons
export const defaultCategories: Category[] = [
  { id: "1", name: "Salário", type: "income", color: "#22c55e", icon: Banknote },
  { id: "2", name: "Freelance", type: "income", color: "#10b981", icon: Briefcase },
  { id: "3", name: "Investimentos", type: "income", color: "#14b8a6", icon: TrendingUp },
  { id: "4", name: "Outros", type: "income", color: "#06b6d4", icon: CircleDot },
  { id: "5", name: "Alimentação", type: "expense", color: "#f97316", icon: Utensils },
  { id: "6", name: "Transporte", type: "expense", color: "#eab308", icon: Car },
  { id: "7", name: "Moradia", type: "expense", color: "#ef4444", icon: Home },
  { id: "8", name: "Saúde", type: "expense", color: "#ec4899", icon: Heart },
  { id: "9", name: "Educação", type: "expense", color: "#8b5cf6", icon: GraduationCap },
  { id: "10", name: "Lazer", type: "expense", color: "#6366f1", icon: Gamepad2 },
  { id: "11", name: "Contas", type: "expense", color: "#0ea5e9", icon: Receipt },
  { id: "12", name: "Compras", type: "expense", color: "#84cc16", icon: ShoppingBag },
];

// Helper to get category by id
export function getCategoryById(id: string): Category | undefined {
  return defaultCategories.find(c => c.id === id);
}

// Helper to get category by name (case insensitive)
export function getCategoryByName(name: string): Category | undefined {
  return defaultCategories.find(c => c.name.toLowerCase() === name.toLowerCase());
}
