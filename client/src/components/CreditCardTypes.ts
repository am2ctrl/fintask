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
}

export const cardColors = [
  "#1a1a2e", // Dark navy
  "#16213e", // Dark blue
  "#0f3460", // Royal blue
  "#533483", // Purple
  "#e94560", // Red/Pink
  "#22c55e", // Green
  "#f97316", // Orange
  "#0ea5e9", // Sky blue
  "#8b5cf6", // Violet
  "#ec4899", // Pink
];

export const cardPurposes = [
  { id: "personal", label: "Pessoal", icon: User },
  { id: "home", label: "Casa", icon: Home },
  { id: "shopping", label: "Compras", icon: ShoppingBag },
  { id: "work", label: "Trabalho", icon: Briefcase },
  { id: "health", label: "Saúde", icon: Heart },
  { id: "travel", label: "Viagem", icon: Plane },
  { id: "transport", label: "Transporte", icon: Car },
  { id: "food", label: "Alimentação", icon: Utensils },
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

// Mock data for demonstration
export const mockCreditCards: CreditCardData[] = [
  {
    id: "1",
    name: "Nubank Principal",
    lastFourDigits: "4523",
    type: "physical",
    holder: "Eu",
    purpose: "Pessoal",
    color: "#8b5cf6",
    icon: User,
    limit: 15000,
    closingDay: 3,
    dueDay: 10,
  },
  {
    id: "2",
    name: "Cartão Casa",
    lastFourDigits: "7891",
    type: "virtual",
    holder: "Esposa",
    purpose: "Casa",
    color: "#22c55e",
    icon: Home,
    limit: 8000,
    closingDay: 15,
    dueDay: 22,
  },
  {
    id: "3",
    name: "Cartão Compras",
    lastFourDigits: "2345",
    type: "virtual",
    holder: "Eu",
    purpose: "Compras",
    color: "#f97316",
    icon: ShoppingBag,
    limit: 5000,
    closingDay: 1,
    dueDay: 8,
  },
];
