import {
  CircleDot,
  Banknote,
  Briefcase,
  TrendingUp,
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

/**
 * Mapeamento centralizado de ícones usados no app
 * Usado para converter string IDs em componentes Lucide React
 */
export const iconMap: Record<string, LucideIcon> = {
  "circle-dot": CircleDot,
  "banknote": Banknote,
  "briefcase": Briefcase,
  "trending-up": TrendingUp,
  "utensils": Utensils,
  "car": Car,
  "home": Home,
  "heart": Heart,
  "graduation-cap": GraduationCap,
  "gamepad2": Gamepad2,
  "receipt": Receipt,
  "shopping-bag": ShoppingBag,
  "plane": Plane,
  "gift": Gift,
  "coffee": Coffee,
  "shirt": Shirt,
  "smartphone": Smartphone,
  "music": Music,
  "book": Book,
  "dumbbell": Dumbbell,
  "baby": Baby,
  "dog": Dog,
  "wrench": Wrench,
  "sparkles": Sparkles,
};

/**
 * Retorna o componente de ícone correspondente ao nome
 * @param name - Nome do ícone (ex: "utensils", "car")
 * @returns Componente LucideIcon ou CircleDot como fallback
 */
export function getIconByName(name: string): LucideIcon {
  const icon = iconMap[name] || iconMap[name.toLowerCase()];
  return icon || CircleDot;
}
