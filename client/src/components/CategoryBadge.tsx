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

export type ExpenseNature = "fixed" | "variable";

export interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
  color: string;
  icon: LucideIcon;
  nature?: ExpenseNature;
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
      {category.nature && (
        <span className="ml-1 opacity-70 text-[10px]">
          {category.nature === "fixed" ? "F" : "V"}
        </span>
      )}
    </Badge>
  );

  if (showTooltip && category.description) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p className="font-medium">{category.name}</p>
          <p className="text-xs text-muted-foreground">{category.description}</p>
          {category.nature && (
            <p className="text-xs mt-1">
              <span className="font-medium">Tipo:</span>{" "}
              {category.nature === "fixed" ? "Despesa Fixa" : "Despesa Variável"}
            </p>
          )}
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

// Expense nature explanations for tooltips
export const expenseNatureInfo = {
  fixed: {
    label: "Despesa Fixa",
    description: "Valores que se repetem todo mês com valor igual ou muito similar. Ex: aluguel, condomínio, plano de saúde, assinaturas.",
    examples: ["Aluguel", "Condomínio", "Internet", "Plano de celular", "Netflix", "Spotify", "Academia"],
  },
  variable: {
    label: "Despesa Variável", 
    description: "Valores que mudam a cada mês dependendo do seu consumo. Ex: alimentação, combustível, lazer, compras.",
    examples: ["Supermercado", "Restaurantes", "Combustível", "Uber", "Roupas", "Presentes"],
  },
};

// Default categories with icons, nature, and descriptions
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
  
  // Expense categories - Fixed
  { 
    id: "5", 
    name: "Alimentação", 
    type: "expense", 
    color: "#f97316", 
    icon: Utensils,
    nature: "variable",
    description: "Supermercado, restaurantes, delivery, lanches e todas as despesas com comida."
  },
  { 
    id: "6", 
    name: "Transporte", 
    type: "expense", 
    color: "#eab308", 
    icon: Car,
    nature: "variable",
    description: "Combustível, Uber, táxi, estacionamento, pedágio, manutenção do veículo."
  },
  { 
    id: "7", 
    name: "Moradia", 
    type: "expense", 
    color: "#ef4444", 
    icon: Home,
    nature: "fixed",
    description: "Aluguel, condomínio, IPTU, financiamento imobiliário, reformas e manutenção da casa."
  },
  { 
    id: "8", 
    name: "Saúde", 
    type: "expense", 
    color: "#ec4899", 
    icon: Heart,
    nature: "variable",
    description: "Plano de saúde (fixo), consultas, medicamentos, exames, tratamentos."
  },
  { 
    id: "9", 
    name: "Educação", 
    type: "expense", 
    color: "#8b5cf6", 
    icon: GraduationCap,
    nature: "fixed",
    description: "Mensalidade escolar/faculdade, cursos, livros, material escolar."
  },
  { 
    id: "10", 
    name: "Lazer", 
    type: "expense", 
    color: "#6366f1", 
    icon: Gamepad2,
    nature: "variable",
    description: "Cinema, shows, viagens, hobbies, jogos, entretenimento em geral."
  },
  { 
    id: "11", 
    name: "Contas", 
    type: "expense", 
    color: "#0ea5e9", 
    icon: Receipt,
    nature: "fixed",
    description: "Luz, água, gás, internet, telefone, assinaturas de streaming e serviços."
  },
  { 
    id: "12", 
    name: "Compras", 
    type: "expense", 
    color: "#84cc16", 
    icon: ShoppingBag,
    nature: "variable",
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

// Nature badge component
export function NatureBadge({ nature }: { nature: ExpenseNature }) {
  const info = expenseNatureInfo[nature];
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge 
          variant="outline" 
          className={`text-xs cursor-help ${
            nature === "fixed" 
              ? "border-blue-500/50 text-blue-600 dark:text-blue-400" 
              : "border-amber-500/50 text-amber-600 dark:text-amber-400"
          }`}
        >
          {nature === "fixed" ? "Fixa" : "Variável"}
        </Badge>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <p className="font-medium">{info.label}</p>
        <p className="text-xs text-muted-foreground mt-1">{info.description}</p>
        <p className="text-xs mt-2">
          <span className="font-medium">Exemplos:</span> {info.examples.join(", ")}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}
