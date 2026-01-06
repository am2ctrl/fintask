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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { CreditCard as CreditCardIcon, Smartphone, Users } from "lucide-react";
import type { CreditCardData } from "./CreditCardTypes";
import { cardColors, cardPurposes, cardHolders } from "./CreditCardTypes";
import type { LucideIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { ApiFamilyMember } from "@/shared/types/api";

interface CreditCardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card?: CreditCardData | null;
  onSave: (data: Omit<CreditCardData, "id">) => void;
}

export function CreditCardModal({
  open,
  onOpenChange,
  card,
  onSave,
}: CreditCardModalProps) {
  const [name, setName] = useState("");
  const [lastFourDigits, setLastFourDigits] = useState("");
  const [type, setType] = useState<"physical" | "virtual">("physical");
  const [holder, setHolder] = useState(cardHolders[0]);
  const [holderFamilyMemberId, setHolderFamilyMemberId] = useState<string>("");
  const [purposeId, setPurposeId] = useState(cardPurposes[0].id);
  const [color, setColor] = useState(cardColors[0]);
  const [limit, setLimit] = useState("");
  const [closingDay, setClosingDay] = useState("");
  const [dueDay, setDueDay] = useState("");

  // Buscar membros da família
  const { data: familyMembers = [] } = useQuery<ApiFamilyMember[]>({
    queryKey: ["/api/family-members"],
  });

  useEffect(() => {
    if (card) {
      setName(card.name);
      setLastFourDigits(card.lastFourDigits);
      setType(card.type);
      setHolder(card.holder);
      setHolderFamilyMemberId(card.holderFamilyMemberId || "");
      setPurposeId(cardPurposes.find(p => p.label === card.purpose)?.id || cardPurposes[0].id);
      setColor(card.color);
      setLimit(card.limit?.toString() || "");
      setClosingDay(card.closingDay?.toString() || "");
      setDueDay(card.dueDay?.toString() || "");
    } else {
      setName("");
      setLastFourDigits("");
      setType("physical");
      setHolder(cardHolders[0]);
      setHolderFamilyMemberId("");
      setPurposeId(cardPurposes[0].id);
      setColor(cardColors[0]);
      setLimit("");
      setClosingDay("");
      setDueDay("");
    }
  }, [card, open]);

  const handleSave = () => {
    if (!name.trim() || lastFourDigits.length !== 4) return;

    const purpose = cardPurposes.find(p => p.id === purposeId)!;

    onSave({
      name: name.trim(),
      lastFourDigits,
      type,
      holder,
      purpose: purpose.label,
      color,
      icon: purpose.icon,
      limit: limit ? parseFloat(limit) : undefined,
      closingDay: closingDay ? parseInt(closingDay) : undefined,
      dueDay: dueDay ? parseInt(dueDay) : undefined,
      holderFamilyMemberId: holderFamilyMemberId || null,
    });
    onOpenChange(false);
  };

  const selectedPurpose = cardPurposes.find(p => p.id === purposeId)!;
  const PurposeIcon = selectedPurpose.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" data-testid="modal-credit-card">
        <DialogHeader>
          <DialogTitle>
            {card ? "Editar Cartão" : "Novo Cartão"}
          </DialogTitle>
          <DialogDescription>
            {card ? "Altere os dados do cartão" : "Adicione um novo cartão de crédito"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Cartão</Label>
              <Input
                id="name"
                placeholder="Ex: Nubank Principal"
                value={name}
                onChange={(e) => setName(e.target.value)}
                data-testid="input-card-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="digits">Últimos 4 dígitos</Label>
              <Input
                id="digits"
                placeholder="0000"
                maxLength={4}
                value={lastFourDigits}
                onChange={(e) => setLastFourDigits(e.target.value.replace(/\D/g, "").slice(0, 4))}
                data-testid="input-card-digits"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={type === "physical" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setType("physical")}
                  data-testid="button-type-physical"
                >
                  <CreditCardIcon className="w-4 h-4 mr-2" />
                  Físico
                </Button>
                <Button
                  type="button"
                  variant={type === "virtual" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setType("virtual")}
                  data-testid="button-type-virtual"
                >
                  <Smartphone className="w-4 h-4 mr-2" />
                  Virtual
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Titular</Label>
              <Select value={holder} onValueChange={setHolder}>
                <SelectTrigger data-testid="select-holder">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {cardHolders.map((h) => (
                    <SelectItem key={h} value={h}>{h}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Novo campo: Membro da Família */}
          {familyMembers.length > 0 && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Associar a Membro da Família (opcional)
              </Label>
              <Select value={holderFamilyMemberId} onValueChange={setHolderFamilyMemberId}>
                <SelectTrigger data-testid="select-family-member">
                  <SelectValue placeholder="Nenhum (cartão principal)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhum (cartão principal)</SelectItem>
                  {familyMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name} {member.is_primary && "(Principal)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Ao importar extratos, transações deste membro serão automaticamente associadas a este cartão
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label>Função / Propósito</Label>
            <div className="grid grid-cols-4 gap-2">
              {cardPurposes.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setPurposeId(id)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-all hover-elevate ${
                    purposeId === id
                      ? "ring-2 ring-primary bg-primary/10"
                      : "bg-muted/50"
                  }`}
                  data-testid={`button-purpose-${id}`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Cor do Cartão</Label>
            <div className="flex flex-wrap gap-2">
              {cardColors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-lg transition-transform ${
                    color === c ? "ring-2 ring-offset-2 ring-primary scale-110" : ""
                  }`}
                  style={{ backgroundColor: c }}
                  data-testid={`button-card-color-${c}`}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="limit">Limite (R$)</Label>
              <Input
                id="limit"
                type="number"
                placeholder="10000"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                data-testid="input-card-limit"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="closing">Dia Fechamento</Label>
              <Input
                id="closing"
                type="number"
                min="1"
                max="31"
                placeholder="15"
                value={closingDay}
                onChange={(e) => setClosingDay(e.target.value)}
                data-testid="input-closing-day"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="due">Dia Vencimento</Label>
              <Input
                id="due"
                type="number"
                min="1"
                max="31"
                placeholder="22"
                value={dueDay}
                onChange={(e) => setDueDay(e.target.value)}
                data-testid="input-due-day"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl text-white mt-2" style={{ backgroundColor: color }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-white/20">
                <PurposeIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold">{name || "Nome do Cartão"}</p>
                <p className="text-xs text-white/70">{selectedPurpose.label}</p>
              </div>
            </div>
            <div className="font-mono tracking-widest">
              **** **** **** {lastFourDigits || "0000"}
            </div>
            <div className="flex justify-between mt-3 text-sm">
              <span>{holder}</span>
              <span className="flex items-center gap-1">
                {type === "physical" ? <CreditCardIcon className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
                {type === "physical" ? "Físico" : "Virtual"}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            data-testid="button-cancel-card"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!name.trim() || lastFourDigits.length !== 4}
            data-testid="button-save-card"
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
