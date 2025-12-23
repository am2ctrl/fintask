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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
  color: string;
  icon: LucideIcon;
  description?: string;
}

interface CategoryBadgeProps {
  category: Category;
  size?: "sm" | "default";
  showIcon?: boolean;
  showTooltip?: boolean;
}

export function CategoryBadge({ category, size = "default", showIcon = true, showTooltip = false }: CategoryBadgeProps) {
  const Icon = category.icon;
  
  const badge = (
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

  if (showTooltip && category.description) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p className="font-medium">{category.name}</p>
          <p className="text-xs text-muted-foreground">{category.description}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return badge;
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

// Default categories with icons and descriptions
export const defaultCategories: Category[] = [
  // Income categories
  { 
    id: "1", 
    name: "Salário", 
    type: "income", 
    color: "#22c55e", 
    icon: Banknote,
    description: "Salário mensal, 13º, férias e outros rendimentos do trabalho CLT ou contrato."
  },
  { 
    id: "2", 
    name: "Freelance", 
    type: "income", 
    color: "#10b981", 
    icon: Briefcase,
    description: "Rendimentos de trabalhos autônomos, projetos avulsos e prestação de serviços."
  },
  { 
    id: "3", 
    name: "Investimentos", 
    type: "income", 
    color: "#14b8a6", 
    icon: TrendingUp,
    description: "Dividendos, juros, rendimentos de aplicações financeiras e lucro de investimentos."
  },
  { 
    id: "4", 
    name: "Outros", 
    type: "income", 
    color: "#06b6d4", 
    icon: CircleDot,
    description: "Outras fontes de receita como presentes, reembolsos, vendas de itens usados."
  },
  
  // Expense categories
  { 
    id: "5", 
    name: "Alimentação", 
    type: "expense", 
    color: "#f97316", 
    icon: Utensils,
    description: "Supermercado, restaurantes, delivery, lanches e todas as despesas com comida."
  },
  { 
    id: "6", 
    name: "Transporte", 
    type: "expense", 
    color: "#eab308", 
    icon: Car,
    description: "Combustível, Uber, táxi, estacionamento, pedágio, manutenção do veículo."
  },
  { 
    id: "7", 
    name: "Moradia", 
    type: "expense", 
    color: "#ef4444", 
    icon: Home,
    description: "Aluguel, condomínio, IPTU, financiamento imobiliário, reformas e manutenção da casa."
  },
  { 
    id: "8", 
    name: "Saúde", 
    type: "expense", 
    color: "#ec4899", 
    icon: Heart,
    description: "Plano de saúde, consultas, medicamentos, exames, tratamentos."
  },
  { 
    id: "9", 
    name: "Educação", 
    type: "expense", 
    color: "#8b5cf6", 
    icon: GraduationCap,
    description: "Mensalidade escolar/faculdade, cursos, livros, material escolar."
  },
  { 
    id: "10", 
    name: "Lazer", 
    type: "expense", 
    color: "#6366f1", 
    icon: Gamepad2,
    description: "Cinema, shows, viagens, hobbies, jogos, entretenimento em geral."
  },
  { 
    id: "11", 
    name: "Contas", 
    type: "expense", 
    color: "#0ea5e9", 
    icon: Receipt,
    description: "Luz, água, gás, internet, telefone, assinaturas de streaming e serviços."
  },
  { 
    id: "12", 
    name: "Compras", 
    type: "expense", 
    color: "#84cc16", 
    icon: ShoppingBag,
    description: "Roupas, eletrônicos, itens para casa, presentes e compras em geral."
  },
];

// Helper to get category by id
export function getCategoryById(id: string): Category | undefined {
  return defaultCategories.find(c => c.id === id);
}

// Helper to get category by name (case insensitive)
export function getCategoryByName(name: string): Category | undefined {
  return defaultCategories.find(c => c.name.toLowerCase() === name.toLowerCase());
}
