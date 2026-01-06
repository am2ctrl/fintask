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
  Coffee,
  Shirt,
  Smartphone,
  Music,
  Book,
  Dumbbell,
  Baby,
  Dog,
  Wrench,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

const colorOptions = [
  "#22c55e", "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9",
  "#6366f1", "#8b5cf6", "#ec4899", "#ef4444", "#f97316",
  "#eab308", "#84cc16",
];

const iconOptions: { id: string; icon: LucideIcon; label: string }[] = [
  { id: "banknote", icon: Banknote, label: "Dinheiro" },
  { id: "briefcase", icon: Briefcase, label: "Trabalho" },
  { id: "trending-up", icon: TrendingUp, label: "Investimento" },
  { id: "circle-dot", icon: CircleDot, label: "Genérico" },
  { id: "utensils", icon: Utensils, label: "Alimentação" },
  { id: "car", icon: Car, label: "Transporte" },
  { id: "home", icon: Home, label: "Moradia" },
  { id: "heart", icon: Heart, label: "Saúde" },
  { id: "graduation-cap", icon: GraduationCap, label: "Educação" },
  { id: "gamepad2", icon: Gamepad2, label: "Lazer" },
  { id: "receipt", icon: Receipt, label: "Contas" },
  { id: "shopping-bag", icon: ShoppingBag, label: "Compras" },
  { id: "plane", icon: Plane, label: "Viagem" },
  { id: "gift", icon: Gift, label: "Presente" },
  { id: "coffee", icon: Coffee, label: "Café" },
  { id: "shirt", icon: Shirt, label: "Roupas" },
  { id: "smartphone", icon: Smartphone, label: "Tecnologia" },
  { id: "music", icon: Music, label: "Música" },
  { id: "book", icon: Book, label: "Livros" },
  { id: "dumbbell", icon: Dumbbell, label: "Academia" },
  { id: "baby", icon: Baby, label: "Filhos" },
  { id: "dog", icon: Dog, label: "Pets" },
  { id: "wrench", icon: Wrench, label: "Manutenção" },
  { id: "sparkles", icon: Sparkles, label: "Outros" },
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
  onSave: (data: { name: string; color: string; type: "income" | "expense"; icon: LucideIcon }) => void;
}

export function CategoryModal({
  open,
  onOpenChange,
  category,
  type,
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
    onSave({ name: name.trim(), color, type, icon });
    onOpenChange(false);
  };

  const SelectedIcon = getIconById(selectedIconId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="modal-category">
        <DialogHeader>
          <DialogTitle>
            {category ? "Editar Categoria" : "Nova Categoria"}
          </DialogTitle>
          <DialogDescription>
            {category ? "Altere os detalhes da categoria" : "Crie uma nova categoria para suas transações"}
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
            <ScrollArea className="h-32 rounded-md border p-2">
              <div className="grid grid-cols-6 gap-2">
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
