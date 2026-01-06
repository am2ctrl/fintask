import type { LucideIcon } from "lucide-react";
import {
  CreditCard,
  Smartphone,
  User,
  Home,
  ShoppingBag,
  Briefcase,
  Heart,
  Plane,
  Car,
  Utensils,
  type LucideIcon as LucideIconType,
} from "lucide-react";

export interface CreditCardData {
  id: string;
  name: string;
  lastFourDigits: string;
  type: "physical" | "virtual";
  holder: string;
  purpose: string;
  color: string;
  icon: LucideIconType;
  limit?: number;
  closingDay?: number;
  dueDay?: number;
  holderFamilyMemberId?: string | null;
}

export const cardColors = [
  "#1a1a2e",
  "#16213e",
  "#0f3460",
  "#533483",
  "#e94560",
  "#22c55e",
  "#f97316",
  "#0ea5e9",
  "#8b5cf6",
  "#ec4899",
];

export const cardPurposes = [
  { id: "personal", label: "Pessoal", icon: User },
  { id: "home", label: "Casa", icon: Home },
  { id: "shopping", label: "Compras", icon: ShoppingBag },
  { id: "work", label: "Trabalho", icon: Briefcase },
  { id: "health", label: "Saude", icon: Heart },
  { id: "travel", label: "Viagem", icon: Plane },
  { id: "transport", label: "Transporte", icon: Car },
  { id: "food", label: "Alimentacao", icon: Utensils },
];

export const cardHolders = [
  "Eu",
  "Esposa",
  "Marido",
  "Filho(a)",
  "Familiar",
  "Empresa",
];

export function getCardIcon(type: "physical" | "virtual"): LucideIcon {
  return type === "physical" ? CreditCard : Smartphone;
}
