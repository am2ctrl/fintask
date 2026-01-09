import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import type { Category } from "./CategoryBadge";
import {
  // Dinheiro/Finanças
  Banknote,
  Wallet,
  CircleDollarSign,
  TrendingUp,
  Award,
  RotateCcw,

  // Trabalho
  Briefcase,

  // Casa/Moradia
  Home,
  Building,
  Building2,
  Zap,
  Wrench,
  Cpu,
  Sofa,

  // Transporte
  Car,
  Fuel,
  Bus,
  Plane,
  Gauge,
  Settings,
  FileText,

  // Alimentação
  Utensils,
  ShoppingCart,
  Croissant,
  Pill,

  // Saúde
  Heart,
  ShieldCheck,
  Cross,
  Stethoscope,
  Syringe,
  Sparkles,

  // Educação
  GraduationCap,
  School,
  BookOpen,
  Book,

  // Lazer
  PartyPopper,
  Clapperboard,
  Palette,
  Wine,
  Gamepad2,

  // Streaming/Serviços
  Tv,
  Play,
  Music,
  Cloud,
  Bot,

  // Tributos
  Landmark,
  FileSpreadsheet,
  BadgeCheck,
  AlertTriangle,
  Flame,
  Receipt,

  // Compras
  ShoppingBag,
  Shirt,
  Gift,
  Smartphone,

  // Outros
  CircleDot,
  ArrowRightLeft,
  HelpCircle,

  // Extras úteis
  Coffee,
  Dumbbell,
  Baby,
  Dog,

  type LucideIcon,
} from "lucide-react";

const colorOptions = [
  "#22c55e", "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9",
  "#6366f1", "#8b5cf6", "#a855f7", "#ec4899", "#f472b6",
  "#ef4444", "#f97316", "#eab308", "#84cc16", "#64748b",
  "#9ca3af",
];

const iconOptions: { id: string; icon: LucideIcon; label: string }[] = [
  // Dinheiro/Finanças
  { id: "banknote", icon: Banknote, label: "Dinheiro" },
  { id: "wallet", icon: Wallet, label: "Carteira" },
  { id: "circle-dollar-sign", icon: CircleDollarSign, label: "Cifrão" },
  { id: "trending-up", icon: TrendingUp, label: "Investimento" },
  { id: "award", icon: Award, label: "Prêmio" },
  { id: "rotate-ccw", icon: RotateCcw, label: "Reembolso" },

  // Trabalho
  { id: "briefcase", icon: Briefcase, label: "Trabalho" },

  // Casa/Moradia
  { id: "home", icon: Home, label: "Casa" },
  { id: "building", icon: Building, label: "Prédio" },
  { id: "building2", icon: Building2, label: "Banco" },
  { id: "zap", icon: Zap, label: "Energia" },
  { id: "wrench", icon: Wrench, label: "Manutenção" },
  { id: "cpu", icon: Cpu, label: "Smart Home" },
  { id: "sofa", icon: Sofa, label: "Móveis" },

  // Transporte
  { id: "car", icon: Car, label: "Carro" },
  { id: "fuel", icon: Fuel, label: "Combustível" },
  { id: "bus", icon: Bus, label: "Ônibus" },
  { id: "plane", icon: Plane, label: "Viagem" },
  { id: "gauge", icon: Gauge, label: "Velocímetro" },
  { id: "settings", icon: Settings, label: "Configurações" },
  { id: "file-text", icon: FileText, label: "Documento" },

  // Alimentação
  { id: "utensils", icon: Utensils, label: "Alimentação" },
  { id: "shopping-cart", icon: ShoppingCart, label: "Supermercado" },
  { id: "croissant", icon: Croissant, label: "Padaria" },
  { id: "pill", icon: Pill, label: "Suplemento" },
  { id: "coffee", icon: Coffee, label: "Café" },

  // Saúde
  { id: "heart", icon: Heart, label: "Saúde" },
  { id: "shield-check", icon: ShieldCheck, label: "Plano" },
  { id: "cross", icon: Cross, label: "Farmácia" },
  { id: "stethoscope", icon: Stethoscope, label: "Médico" },
  { id: "syringe", icon: Syringe, label: "Procedimento" },
  { id: "sparkles", icon: Sparkles, label: "Bem-estar" },
  { id: "dumbbell", icon: Dumbbell, label: "Academia" },

  // Educação
  { id: "graduation-cap", icon: GraduationCap, label: "Educação" },
  { id: "school", icon: School, label: "Escola" },
  { id: "book-open", icon: BookOpen, label: "Curso" },
  { id: "book", icon: Book, label: "Livro" },

  // Lazer
  { id: "party-popper", icon: PartyPopper, label: "Lazer" },
  { id: "clapperboard", icon: Clapperboard, label: "Cinema" },
  { id: "palette", icon: Palette, label: "Arte" },
  { id: "wine", icon: Wine, label: "Bar" },
  { id: "gamepad2", icon: Gamepad2, label: "Games" },

  // Streaming/Serviços
  { id: "tv", icon: Tv, label: "TV" },
  { id: "play", icon: Play, label: "Streaming" },
  { id: "music", icon: Music, label: "Música" },
  { id: "cloud", icon: Cloud, label: "Cloud" },
  { id: "bot", icon: Bot, label: "IA" },

  // Tributos
  { id: "landmark", icon: Landmark, label: "Governo" },
  { id: "file-spreadsheet", icon: FileSpreadsheet, label: "Imposto" },
  { id: "badge-check", icon: BadgeCheck, label: "Certificado" },
  { id: "alert-triangle", icon: AlertTriangle, label: "Multa" },
  { id: "flame", icon: Flame, label: "Incêndio" },
  { id: "receipt", icon: Receipt, label: "Recibo" },

  // Compras
  { id: "shopping-bag", icon: ShoppingBag, label: "Compras" },
  { id: "shirt", icon: Shirt, label: "Roupas" },
  { id: "gift", icon: Gift, label: "Presente" },
  { id: "smartphone", icon: Smartphone, label: "Eletrônico" },

  // Outros
  { id: "circle-dot", icon: CircleDot, label: "Genérico" },
  { id: "arrow-right-left", icon: ArrowRightLeft, label: "Transferência" },
  { id: "help-circle", icon: HelpCircle, label: "Indefinido" },

  // Extras
  { id: "baby", icon: Baby, label: "Filhos" },
  { id: "dog", icon: Dog, label: "Pets" },
];

export function getIconById(iconId: string): LucideIcon {
  return iconOptions.find(i => i.id === iconId)?.icon || CircleDot;
}

export function getIconIdFromComponent(icon: LucideIcon): string {
  return iconOptions.find(i => i.icon === icon)?.id || "circle-dot";
}

interface CategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
  type: "income" | "expense";
  parentId?: string | null;
  onSave: (data: { name: string; color: string; type: "income" | "expense"; icon: LucideIcon; parentId?: string | null }) => void;
}

export function CategoryModal({
  open,
  onOpenChange,
  category,
  type,
  parentId,
  onSave,
}: CategoryModalProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(colorOptions[0]);
  const [selectedIconId, setSelectedIconId] = useState("circle-dot");

  useEffect(() => {
    if (category) {
      setName(category.name);
      setColor(category.color);
      setSelectedIconId(getIconIdFromComponent(category.icon));
    } else {
      setName("");
      setColor(colorOptions[0]);
      setSelectedIconId("circle-dot");
    }
  }, [category, open]);

  const handleSave = () => {
    if (!name.trim()) return;
    const icon = getIconById(selectedIconId);
    console.log("[DEBUG CategoryModal handleSave] parentId prop:", parentId);
    console.log("[DEBUG CategoryModal handleSave] enviando para onSave:", { name: name.trim(), color, type, icon, parentId });
    onSave({ name: name.trim(), color, type, icon, parentId });
    onOpenChange(false);
  };

  const isSubcategory = !!parentId;

  const SelectedIcon = getIconById(selectedIconId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="modal-category">
        <DialogHeader>
          <DialogTitle>
            {category ? "Editar Categoria" : isSubcategory ? "Nova Subcategoria" : "Nova Categoria"}
          </DialogTitle>
          <DialogDescription>
            {category
              ? "Altere os detalhes da categoria"
              : isSubcategory
                ? "Crie uma nova subcategoria dentro da categoria pai"
                : "Crie uma nova categoria para suas transações"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Categoria</Label>
            <Input
              id="name"
              placeholder="Ex: Alimentação"
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-testid="input-category-name"
            />
          </div>

          <div className="space-y-2">
            <Label>Ícone</Label>
            <ScrollArea className="h-40 rounded-md border p-2">
              <div className="grid grid-cols-8 gap-2">
                {iconOptions.map(({ id, icon: Icon, label }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSelectedIconId(id)}
                    title={label}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all hover-elevate ${
                      selectedIconId === id
                        ? "ring-2 ring-primary bg-primary/10"
                        : "bg-muted/50"
                    }`}
                    style={selectedIconId === id ? { color } : undefined}
                    data-testid={`button-icon-${id}`}
                  >
                    <Icon className="w-5 h-5" />
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="space-y-2">
            <Label>Cor</Label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-lg transition-transform ${
                    color === c ? "ring-2 ring-offset-2 ring-primary scale-110" : ""
                  }`}
                  style={{ backgroundColor: c }}
                  data-testid={`button-color-${c}`}
                />
              ))}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground mb-2">Pré-visualização</p>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${color}20` }}
              >
                <SelectedIcon className="w-5 h-5" style={{ color }} />
              </div>
              <span className="font-medium">{name || "Nome da categoria"}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            data-testid="button-cancel-category"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!name.trim()}
            data-testid="button-save-category"
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
