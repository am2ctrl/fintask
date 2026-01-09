import { Badge } from "@/shared/components/ui/badge";
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
  Plane,
  Gift,
  Shirt,
  Smartphone,
  Music,
  Book,
  Sparkles,
  Wrench,
  Wallet,
  Award,
  RotateCcw,
  CircleDollarSign,
  Building,
  Zap,
  Cpu,
  Sofa,
  Fuel,
  Settings,
  FileText,
  Bus,
  Gauge,
  ShoppingCart,
  Croissant,
  Pill,
  ShieldCheck,
  Cross,
  Stethoscope,
  Syringe,
  School,
  BookOpen,
  PartyPopper,
  Clapperboard,
  Palette,
  Wine,
  Tv,
  Play,
  Cloud,
  Bot,
  Landmark,
  FileSpreadsheet,
  BadgeCheck,
  AlertTriangle,
  Flame,
  Building2,
  ArrowRightLeft,
  HelpCircle,
  type LucideIcon
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";

export interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
  color: string;
  icon: LucideIcon;
  description?: string;
  parentId?: string | null;
  parentName?: string;
}

interface CategoryBadgeProps {
  category: Category;
  size?: "sm" | "default";
  showIcon?: boolean;
  showTooltip?: boolean;
  showParent?: boolean;
}

export function CategoryBadge({
  category,
  size = "default",
  showIcon = true,
  showTooltip = false,
  showParent = false
}: CategoryBadgeProps) {
  const Icon = category.icon;
  const displayName = showParent && category.parentName
    ? `${category.parentName} > ${category.name}`
    : category.name;

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
      {displayName}
    </Badge>
  );

  if (showTooltip && category.description) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p className="font-medium">{category.name}</p>
          {category.parentName && (
            <p className="text-xs text-muted-foreground">Categoria: {category.parentName}</p>
          )}
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

// ========================================================
// CATEGORIAS PADRÃO HIERÁRQUICAS
// Organizadas por: Categoria Pai -> Subcategorias
// ========================================================

export const defaultCategories: Category[] = [
  // ========================================================
  // RECEITAS
  // ========================================================

  // PAI: Receitas
  {
    id: "10000000-0000-0000-0000-000000000001",
    name: "Receitas",
    type: "income",
    color: "#22c55e",
    icon: Wallet,
    description: "Categoria pai para todas as receitas",
    parentId: null
  },

  // Subcategorias de Receitas
  {
    id: "10000000-0000-0000-0000-000000000101",
    name: "Salário",
    type: "income",
    color: "#22c55e",
    icon: Banknote,
    description: "Salário mensal, 13º, férias e outros rendimentos do trabalho CLT ou contrato.",
    parentId: "10000000-0000-0000-0000-000000000001",
    parentName: "Receitas"
  },
  {
    id: "10000000-0000-0000-0000-000000000102",
    name: "Freelance",
    type: "income",
    color: "#10b981",
    icon: Briefcase,
    description: "Rendimentos de trabalhos autônomos, projetos avulsos e prestação de serviços.",
    parentId: "10000000-0000-0000-0000-000000000001",
    parentName: "Receitas"
  },
  {
    id: "10000000-0000-0000-0000-000000000103",
    name: "Investimentos",
    type: "income",
    color: "#14b8a6",
    icon: TrendingUp,
    description: "Dividendos, juros, rendimentos de aplicações financeiras e lucro de investimentos.",
    parentId: "10000000-0000-0000-0000-000000000001",
    parentName: "Receitas"
  },
  {
    id: "10000000-0000-0000-0000-000000000104",
    name: "Bonificações",
    type: "income",
    color: "#06b6d4",
    icon: Award,
    description: "Bônus, participação nos lucros, prêmios e gratificações.",
    parentId: "10000000-0000-0000-0000-000000000001",
    parentName: "Receitas"
  },
  {
    id: "10000000-0000-0000-0000-000000000105",
    name: "Reembolsos",
    type: "income",
    color: "#0ea5e9",
    icon: RotateCcw,
    description: "Reembolsos de despesas, devoluções e estornos.",
    parentId: "10000000-0000-0000-0000-000000000001",
    parentName: "Receitas"
  },
  {
    id: "10000000-0000-0000-0000-000000000106",
    name: "Outras Receitas",
    type: "income",
    color: "#6366f1",
    icon: CircleDollarSign,
    description: "Outras fontes de receita como presentes, vendas de itens usados.",
    parentId: "10000000-0000-0000-0000-000000000001",
    parentName: "Receitas"
  },

  // ========================================================
  // 1. MORADIA
  // ========================================================

  // PAI: Moradia
  {
    id: "20000000-0000-0000-0000-000000000001",
    name: "Moradia",
    type: "expense",
    color: "#ef4444",
    icon: Home,
    description: "Gastos fixos e variáveis relacionados à casa",
    parentId: null
  },

  // Subcategorias de Moradia
  {
    id: "20000000-0000-0000-0000-000000000101",
    name: "Habitação",
    type: "expense",
    color: "#ef4444",
    icon: Building,
    description: "Aluguel, prestação do imóvel e condomínio.",
    parentId: "20000000-0000-0000-0000-000000000001",
    parentName: "Moradia"
  },
  {
    id: "20000000-0000-0000-0000-000000000102",
    name: "Contas de Consumo",
    type: "expense",
    color: "#f97316",
    icon: Zap,
    description: "Luz, água, gás e internet.",
    parentId: "20000000-0000-0000-0000-000000000001",
    parentName: "Moradia"
  },
  {
    id: "20000000-0000-0000-0000-000000000103",
    name: "Manutenção",
    type: "expense",
    color: "#eab308",
    icon: Wrench,
    description: "Reparos, itens de limpeza, diarista, prestador de serviço e pequenas reformas.",
    parentId: "20000000-0000-0000-0000-000000000001",
    parentName: "Moradia"
  },
  {
    id: "20000000-0000-0000-0000-000000000104",
    name: "Smart Home",
    type: "expense",
    color: "#84cc16",
    icon: Cpu,
    description: "Robôs de limpeza, automação residencial, câmeras e dispositivos inteligentes.",
    parentId: "20000000-0000-0000-0000-000000000001",
    parentName: "Moradia"
  },
  {
    id: "20000000-0000-0000-0000-000000000105",
    name: "Casa e Utensílios",
    type: "expense",
    color: "#22c55e",
    icon: Sofa,
    description: "Decoração, utensílios de cozinha e pequenos eletrodomésticos.",
    parentId: "20000000-0000-0000-0000-000000000001",
    parentName: "Moradia"
  },

  // ========================================================
  // 2. TRANSPORTE
  // ========================================================

  // PAI: Transporte
  {
    id: "20000000-0000-0000-0000-000000000002",
    name: "Transporte",
    type: "expense",
    color: "#eab308",
    icon: Car,
    description: "Mobilidade e gastos com veículos",
    parentId: null
  },

  // Subcategorias de Transporte
  {
    id: "20000000-0000-0000-0000-000000000201",
    name: "Combustível",
    type: "expense",
    color: "#eab308",
    icon: Fuel,
    description: "Gasolina, álcool e diesel.",
    parentId: "20000000-0000-0000-0000-000000000002",
    parentName: "Transporte"
  },
  {
    id: "20000000-0000-0000-0000-000000000202",
    name: "Manutenção Veicular",
    type: "expense",
    color: "#f97316",
    icon: Settings,
    description: "Oficinas, troca de óleo e pneus.",
    parentId: "20000000-0000-0000-0000-000000000002",
    parentName: "Transporte"
  },
  {
    id: "20000000-0000-0000-0000-000000000203",
    name: "Documentação",
    type: "expense",
    color: "#ef4444",
    icon: FileText,
    description: "Licenciamento e seguro auto.",
    parentId: "20000000-0000-0000-0000-000000000002",
    parentName: "Transporte"
  },
  {
    id: "20000000-0000-0000-0000-000000000204",
    name: "Urbano",
    type: "expense",
    color: "#22c55e",
    icon: Bus,
    description: "Uber, 99, transporte público e estacionamentos.",
    parentId: "20000000-0000-0000-0000-000000000002",
    parentName: "Transporte"
  },
  {
    id: "20000000-0000-0000-0000-000000000205",
    name: "Acessórios Veículo",
    type: "expense",
    color: "#84cc16",
    icon: Gauge,
    description: "Tapete, acessórios e demais aparatos do veículo.",
    parentId: "20000000-0000-0000-0000-000000000002",
    parentName: "Transporte"
  },

  // ========================================================
  // 3. ALIMENTAÇÃO
  // ========================================================

  // PAI: Alimentação
  {
    id: "20000000-0000-0000-0000-000000000003",
    name: "Alimentação",
    type: "expense",
    color: "#f97316",
    icon: Utensils,
    description: "Gastos com comida e bebida",
    parentId: null
  },

  // Subcategorias de Alimentação
  {
    id: "20000000-0000-0000-0000-000000000301",
    name: "Supermercado",
    type: "expense",
    color: "#f97316",
    icon: ShoppingCart,
    description: "Compras essenciais, higiene e mantimentos.",
    parentId: "20000000-0000-0000-0000-000000000003",
    parentName: "Alimentação"
  },
  {
    id: "20000000-0000-0000-0000-000000000302",
    name: "Alimentação Fora",
    type: "expense",
    color: "#ef4444",
    icon: Utensils,
    description: "Restaurantes, iFood, bares e cafézinho (lazer).",
    parentId: "20000000-0000-0000-0000-000000000003",
    parentName: "Alimentação"
  },
  {
    id: "20000000-0000-0000-0000-000000000303",
    name: "Padaria e Feira",
    type: "expense",
    color: "#eab308",
    icon: Croissant,
    description: "Gastos recorrentes menores em padarias e feiras.",
    parentId: "20000000-0000-0000-0000-000000000003",
    parentName: "Alimentação"
  },
  {
    id: "20000000-0000-0000-0000-000000000304",
    name: "Suplementação",
    type: "expense",
    color: "#22c55e",
    icon: Pill,
    description: "Whey protein, vitaminas e suplementos alimentares.",
    parentId: "20000000-0000-0000-0000-000000000003",
    parentName: "Alimentação"
  },

  // ========================================================
  // 4. SAÚDE
  // ========================================================

  // PAI: Saúde
  {
    id: "20000000-0000-0000-0000-000000000004",
    name: "Saúde",
    type: "expense",
    color: "#ec4899",
    icon: Heart,
    description: "Gastos com saúde e bem-estar",
    parentId: null
  },

  // Subcategorias de Saúde
  {
    id: "20000000-0000-0000-0000-000000000401",
    name: "Plano de Saúde",
    type: "expense",
    color: "#ec4899",
    icon: ShieldCheck,
    description: "Mensalidade fixa do plano de saúde.",
    parentId: "20000000-0000-0000-0000-000000000004",
    parentName: "Saúde"
  },
  {
    id: "20000000-0000-0000-0000-000000000402",
    name: "Farmácia",
    type: "expense",
    color: "#f472b6",
    icon: Cross,
    description: "Remédios, cosméticos e itens de saúde.",
    parentId: "20000000-0000-0000-0000-000000000004",
    parentName: "Saúde"
  },
  {
    id: "20000000-0000-0000-0000-000000000403",
    name: "Consultas e Exames",
    type: "expense",
    color: "#db2777",
    icon: Stethoscope,
    description: "Gastos não cobertos pelo plano.",
    parentId: "20000000-0000-0000-0000-000000000004",
    parentName: "Saúde"
  },
  {
    id: "20000000-0000-0000-0000-000000000404",
    name: "Procedimentos",
    type: "expense",
    color: "#be185d",
    icon: Syringe,
    description: "Procedimentos cirúrgicos estéticos e não estéticos.",
    parentId: "20000000-0000-0000-0000-000000000004",
    parentName: "Saúde"
  },
  {
    id: "20000000-0000-0000-0000-000000000405",
    name: "Cuidados e Bem-estar",
    type: "expense",
    color: "#a855f7",
    icon: Sparkles,
    description: "Nutricionista, academia, dermatologista, fisioterapia, salão de beleza.",
    parentId: "20000000-0000-0000-0000-000000000004",
    parentName: "Saúde"
  },

  // ========================================================
  // 5. EDUCAÇÃO
  // ========================================================

  // PAI: Educação
  {
    id: "20000000-0000-0000-0000-000000000005",
    name: "Educação",
    type: "expense",
    color: "#8b5cf6",
    icon: GraduationCap,
    description: "Gastos com educação e formação",
    parentId: null
  },

  // Subcategorias de Educação
  {
    id: "20000000-0000-0000-0000-000000000501",
    name: "Mensalidade Escolar",
    type: "expense",
    color: "#8b5cf6",
    icon: School,
    description: "Mensalidade escolar, faculdade e pós-graduação.",
    parentId: "20000000-0000-0000-0000-000000000005",
    parentName: "Educação"
  },
  {
    id: "20000000-0000-0000-0000-000000000502",
    name: "Cursos",
    type: "expense",
    color: "#7c3aed",
    icon: BookOpen,
    description: "Cursos livres, workshops e treinamentos.",
    parentId: "20000000-0000-0000-0000-000000000005",
    parentName: "Educação"
  },
  {
    id: "20000000-0000-0000-0000-000000000503",
    name: "Livros e Material",
    type: "expense",
    color: "#6d28d9",
    icon: Book,
    description: "Livros, material escolar e didático.",
    parentId: "20000000-0000-0000-0000-000000000005",
    parentName: "Educação"
  },

  // ========================================================
  // 6. LAZER E ESTILO DE VIDA
  // ========================================================

  // PAI: Lazer
  {
    id: "20000000-0000-0000-0000-000000000006",
    name: "Lazer",
    type: "expense",
    color: "#6366f1",
    icon: PartyPopper,
    description: "Entretenimento e estilo de vida",
    parentId: null
  },

  // Subcategorias de Lazer
  {
    id: "20000000-0000-0000-0000-000000000601",
    name: "Viagens e Férias",
    type: "expense",
    color: "#6366f1",
    icon: Plane,
    description: "Passagens, hospedagem e gastos de turismo.",
    parentId: "20000000-0000-0000-0000-000000000006",
    parentName: "Lazer"
  },
  {
    id: "20000000-0000-0000-0000-000000000602",
    name: "Entretenimento",
    type: "expense",
    color: "#818cf8",
    icon: Clapperboard,
    description: "Cinema, teatro, shopping, eventos esportivos e ingressos.",
    parentId: "20000000-0000-0000-0000-000000000006",
    parentName: "Lazer"
  },
  {
    id: "20000000-0000-0000-0000-000000000603",
    name: "Hobbies e Cultura",
    type: "expense",
    color: "#a5b4fc",
    icon: Palette,
    description: "Livros, jogos, instrumentos musicais ou qualquer hobby.",
    parentId: "20000000-0000-0000-0000-000000000006",
    parentName: "Lazer"
  },
  {
    id: "20000000-0000-0000-0000-000000000604",
    name: "Vida Noturna",
    type: "expense",
    color: "#4f46e5",
    icon: Wine,
    description: "Bares, baladas, shows e festas.",
    parentId: "20000000-0000-0000-0000-000000000006",
    parentName: "Lazer"
  },

  // ========================================================
  // 7. STREAMING E SERVIÇOS
  // ========================================================

  // PAI: Streaming/Serviços
  {
    id: "20000000-0000-0000-0000-000000000007",
    name: "Streaming e Serviços",
    type: "expense",
    color: "#0ea5e9",
    icon: Tv,
    description: "Assinaturas digitais e serviços online",
    parentId: null
  },

  // Subcategorias de Streaming
  {
    id: "20000000-0000-0000-0000-000000000701",
    name: "Streaming TV",
    type: "expense",
    color: "#0ea5e9",
    icon: Play,
    description: "Netflix, Prime, Max, Apple TV, Disney+ e similares.",
    parentId: "20000000-0000-0000-0000-000000000007",
    parentName: "Streaming e Serviços"
  },
  {
    id: "20000000-0000-0000-0000-000000000702",
    name: "Música",
    type: "expense",
    color: "#06b6d4",
    icon: Music,
    description: "Spotify, Apple Music, Deezer e similares.",
    parentId: "20000000-0000-0000-0000-000000000007",
    parentName: "Streaming e Serviços"
  },
  {
    id: "20000000-0000-0000-0000-000000000703",
    name: "Cloud e Storage",
    type: "expense",
    color: "#14b8a6",
    icon: Cloud,
    description: "iCloud, Google One, Google Workspace, Microsoft 365.",
    parentId: "20000000-0000-0000-0000-000000000007",
    parentName: "Streaming e Serviços"
  },
  {
    id: "20000000-0000-0000-0000-000000000704",
    name: "Inteligência Artificial",
    type: "expense",
    color: "#8b5cf6",
    icon: Bot,
    description: "ChatGPT, Claude, Midjourney e outras ferramentas de IA.",
    parentId: "20000000-0000-0000-0000-000000000007",
    parentName: "Streaming e Serviços"
  },
  {
    id: "20000000-0000-0000-0000-000000000705",
    name: "Games",
    type: "expense",
    color: "#22c55e",
    icon: Gamepad2,
    description: "PS Store, Xbox Game Pass, Steam e outros jogos.",
    parentId: "20000000-0000-0000-0000-000000000007",
    parentName: "Streaming e Serviços"
  },

  // ========================================================
  // 8. TRIBUTOS
  // ========================================================

  // PAI: Tributos
  {
    id: "20000000-0000-0000-0000-000000000008",
    name: "Tributos",
    type: "expense",
    color: "#64748b",
    icon: Landmark,
    description: "Impostos, taxas e contribuições",
    parentId: null
  },

  // Subcategorias de Tributos
  {
    id: "20000000-0000-0000-0000-000000000801",
    name: "IPVA",
    type: "expense",
    color: "#64748b",
    icon: Car,
    description: "Imposto sobre Propriedade de Veículos Automotores.",
    parentId: "20000000-0000-0000-0000-000000000008",
    parentName: "Tributos"
  },
  {
    id: "20000000-0000-0000-0000-000000000802",
    name: "IPTU",
    type: "expense",
    color: "#475569",
    icon: Home,
    description: "Imposto Predial e Territorial Urbano.",
    parentId: "20000000-0000-0000-0000-000000000008",
    parentName: "Tributos"
  },
  {
    id: "20000000-0000-0000-0000-000000000803",
    name: "IRPF",
    type: "expense",
    color: "#334155",
    icon: FileSpreadsheet,
    description: "Imposto de Renda Pessoa Física.",
    parentId: "20000000-0000-0000-0000-000000000008",
    parentName: "Tributos"
  },
  {
    id: "20000000-0000-0000-0000-000000000804",
    name: "Ganho de Capital",
    type: "expense",
    color: "#1e293b",
    icon: TrendingUp,
    description: "Imposto sobre ganho de capital em investimentos.",
    parentId: "20000000-0000-0000-0000-000000000008",
    parentName: "Tributos"
  },
  {
    id: "20000000-0000-0000-0000-000000000805",
    name: "Taxas Profissionais",
    type: "expense",
    color: "#94a3b8",
    icon: BadgeCheck,
    description: "OAB, CRO, CREA e outras anuidades profissionais.",
    parentId: "20000000-0000-0000-0000-000000000008",
    parentName: "Tributos"
  },
  {
    id: "20000000-0000-0000-0000-000000000806",
    name: "Multas",
    type: "expense",
    color: "#ef4444",
    icon: AlertTriangle,
    description: "Multas de trânsito e outras penalidades.",
    parentId: "20000000-0000-0000-0000-000000000008",
    parentName: "Tributos"
  },
  {
    id: "20000000-0000-0000-0000-000000000807",
    name: "Seguro Incêndio",
    type: "expense",
    color: "#f97316",
    icon: Flame,
    description: "Seguro obrigatório de incêndio do imóvel.",
    parentId: "20000000-0000-0000-0000-000000000008",
    parentName: "Tributos"
  },
  {
    id: "20000000-0000-0000-0000-000000000808",
    name: "Outros Tributos",
    type: "expense",
    color: "#cbd5e1",
    icon: Receipt,
    description: "Outros impostos e taxas não categorizados.",
    parentId: "20000000-0000-0000-0000-000000000008",
    parentName: "Tributos"
  },

  // ========================================================
  // 9. COMPRAS
  // ========================================================

  // PAI: Compras
  {
    id: "20000000-0000-0000-0000-000000000009",
    name: "Compras",
    type: "expense",
    color: "#84cc16",
    icon: ShoppingBag,
    description: "Bens de consumo e compras em geral",
    parentId: null
  },

  // Subcategorias de Compras
  {
    id: "20000000-0000-0000-0000-000000000901",
    name: "Vestuário",
    type: "expense",
    color: "#84cc16",
    icon: Shirt,
    description: "Roupas, sapatos e acessórios (bolsas, cintos).",
    parentId: "20000000-0000-0000-0000-000000000009",
    parentName: "Compras"
  },
  {
    id: "20000000-0000-0000-0000-000000000902",
    name: "Presentes",
    type: "expense",
    color: "#22c55e",
    icon: Gift,
    description: "Aniversários, datas comemorativas e doações.",
    parentId: "20000000-0000-0000-0000-000000000009",
    parentName: "Compras"
  },
  {
    id: "20000000-0000-0000-0000-000000000903",
    name: "Eletrônicos",
    type: "expense",
    color: "#0ea5e9",
    icon: Smartphone,
    description: "Celulares, periféricos de informática e gadgets.",
    parentId: "20000000-0000-0000-0000-000000000009",
    parentName: "Compras"
  },
  {
    id: "20000000-0000-0000-0000-000000000904",
    name: "Cuidados Pessoais",
    type: "expense",
    color: "#ec4899",
    icon: Sparkles,
    description: "Perfumaria e cosméticos (que não sejam de farmácia).",
    parentId: "20000000-0000-0000-0000-000000000009",
    parentName: "Compras"
  },

  // ========================================================
  // 10. OUTROS
  // ========================================================

  // PAI: Outros
  {
    id: "20000000-0000-0000-0000-000000000010",
    name: "Outros",
    type: "expense",
    color: "#9ca3af",
    icon: CircleDot,
    description: "Despesas não categorizadas",
    parentId: null
  },

  // Subcategorias de Outros
  {
    id: "20000000-0000-0000-0000-000000001001",
    name: "Taxas Bancárias",
    type: "expense",
    color: "#6b7280",
    icon: Building2,
    description: "Tarifas bancárias, IOF, anuidade de cartão e taxas.",
    parentId: "20000000-0000-0000-0000-000000000010",
    parentName: "Outros"
  },
  {
    id: "20000000-0000-0000-0000-000000001002",
    name: "Transferências",
    type: "expense",
    color: "#9ca3af",
    icon: ArrowRightLeft,
    description: "Transferências entre contas e pagamentos diversos.",
    parentId: "20000000-0000-0000-0000-000000000010",
    parentName: "Outros"
  },
  {
    id: "20000000-0000-0000-0000-000000001003",
    name: "Não Identificado",
    type: "expense",
    color: "#d1d5db",
    icon: HelpCircle,
    description: "Transações ainda não categorizadas.",
    parentId: "20000000-0000-0000-0000-000000000010",
    parentName: "Outros"
  },
];

// ========================================================
// HELPERS
// ========================================================

// Helper to get category by id
export function getCategoryById(id: string): Category | undefined {
  return defaultCategories.find(c => c.id === id);
}

// Helper to get category by name (case insensitive)
export function getCategoryByName(name: string): Category | undefined {
  return defaultCategories.find(c => c.name.toLowerCase() === name.toLowerCase());
}

// Helper to get parent categories only
export function getParentCategories(): Category[] {
  return defaultCategories.filter(c => c.parentId === null);
}

// Helper to get subcategories of a parent
export function getSubcategories(parentId: string): Category[] {
  return defaultCategories.filter(c => c.parentId === parentId);
}

// Helper to get all subcategories (excludes parent categories)
export function getAllSubcategories(): Category[] {
  return defaultCategories.filter(c => c.parentId !== null);
}

// Helper to group categories by parent
export function getCategoriesGrouped(): Map<Category, Category[]> {
  const grouped = new Map<Category, Category[]>();
  const parents = getParentCategories();

  for (const parent of parents) {
    grouped.set(parent, getSubcategories(parent.id));
  }

  return grouped;
}
