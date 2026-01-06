import { CreditCard as CreditCardIcon, Smartphone, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import type { CreditCardData } from "./CreditCardTypes";
import { formatCurrency } from "@/features/dashboard/components/SummaryCard";

interface CreditCardDisplayProps {
  card: CreditCardData;
  spent?: number;
  onEdit?: (card: CreditCardData) => void;
  onDelete?: (id: string) => void;
}

export function CreditCardDisplay({ card, spent = 0, onEdit, onDelete }: CreditCardDisplayProps) {
  const Icon = card.icon;
  const TypeIcon = card.type === "physical" ? CreditCardIcon : Smartphone;
  const usagePercent = card.limit ? Math.min((spent / card.limit) * 100, 100) : 0;
  
  return (
    <div
      className="group relative rounded-xl p-5 text-white overflow-hidden"
      style={{ backgroundColor: card.color }}
      data-testid={`card-credit-${card.id}`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-black/10 translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-white/20">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold">{card.name}</p>
              <p className="text-xs text-white/70">{card.purpose}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 invisible group-hover:visible">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => onEdit?.(card)}
              data-testid={`button-edit-card-${card.id}`}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => onDelete?.(card.id)}
              data-testid={`button-delete-card-${card.id}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4 font-mono text-lg tracking-widest">
          <span className="text-white/50">****</span>
          <span className="text-white/50">****</span>
          <span className="text-white/50">****</span>
          <span>{card.lastFourDigits}</span>
        </div>

        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs text-white/70 mb-1">Titular</p>
            <p className="font-medium">{card.holder}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant="secondary" 
              className="bg-white/20 text-white border-0 text-xs"
            >
              <TypeIcon className="w-3 h-3 mr-1" />
              {card.type === "physical" ? "Físico" : "Virtual"}
            </Badge>
          </div>
        </div>

        {card.limit && (
          <div className="mt-4 pt-4 border-t border-white/20">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-white/70">Gasto este mês</span>
              <span className="font-mono font-semibold">
                {formatCurrency(spent)} / {formatCurrency(card.limit)}
              </span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white/80 rounded-full transition-all"
                style={{ width: `${usagePercent}%` }}
              />
            </div>
          </div>
        )}

        {(card.closingDay || card.dueDay) && (
          <div className="flex items-center gap-4 mt-3 text-xs text-white/70">
            {card.closingDay && <span>Fecha: dia {card.closingDay}</span>}
            {card.dueDay && <span>Vence: dia {card.dueDay}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

export function CreditCardMini({ card, onClick }: { card: CreditCardData; onClick?: () => void }) {
  const Icon = card.icon;
  const TypeIcon = card.type === "physical" ? CreditCardIcon : Smartphone;

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 p-3 rounded-lg hover-elevate active-elevate-2 w-full text-left"
      style={{ backgroundColor: `${card.color}15` }}
      data-testid={`card-mini-${card.id}`}
    >
      <div
        className="p-2 rounded-lg"
        style={{ backgroundColor: card.color }}
      >
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{card.name}</p>
        <p className="text-xs text-muted-foreground">
          **** {card.lastFourDigits} - {card.holder}
        </p>
      </div>
      <TypeIcon className="w-4 h-4 text-muted-foreground" />
    </button>
  );
}
