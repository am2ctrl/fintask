import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Search, Users } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { Calendar } from "@/shared/components/ui/calendar";
import { defaultCategories } from "@/features/categories/components/CategoryBadge";
import { useQuery } from "@tanstack/react-query";
import type { ApiFamilyMember } from "@/shared/types/api";

export interface FilterState {
  search: string;
  type: "all" | "income" | "expense";
  categoryId: string;
  familyMemberId: string;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
}

interface TransactionFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export function TransactionFilters({ filters, onFiltersChange }: TransactionFiltersProps) {
  const { data: familyMembers = [] } = useQuery<ApiFamilyMember[]>({
    queryKey: ["/api/family-members"],
  });

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="flex flex-wrap items-center gap-3" data-testid="transaction-filters">
      <div className="relative flex-1 min-w-48">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar transações..."
          value={filters.search}
          onChange={(e) => updateFilter("search", e.target.value)}
          className="pl-9"
          data-testid="input-search"
        />
      </div>

      <Select
        value={filters.type}
        onValueChange={(v) => updateFilter("type", v as FilterState["type"])}
      >
        <SelectTrigger className="w-36" data-testid="select-type-filter">
          <SelectValue placeholder="Tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="income">Receitas</SelectItem>
          <SelectItem value="expense">Despesas</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.categoryId}
        onValueChange={(v) => updateFilter("categoryId", v)}
      >
        <SelectTrigger className="w-44" data-testid="select-category-filter">
          <SelectValue placeholder="Categoria" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas categorias</SelectItem>
          {defaultCategories.map((cat) => (
            <SelectItem key={cat.id} value={cat.id}>
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                {cat.name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {familyMembers.length > 0 && (
        <Select
          value={filters.familyMemberId}
          onValueChange={(v) => updateFilter("familyMemberId", v)}
        >
          <SelectTrigger className="w-44" data-testid="select-member-filter">
            <Users className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Membro" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os membros</SelectItem>
            <SelectItem value="main">Você (Principal)</SelectItem>
            {familyMembers.map((member) => (
              <SelectItem key={member.id} value={member.id}>
                {member.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="min-w-32" data-testid="button-date-from">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {filters.dateFrom
              ? format(filters.dateFrom, "dd/MM/yy", { locale: ptBR })
              : "De"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={filters.dateFrom}
            onSelect={(d) => updateFilter("dateFrom", d)}
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="min-w-32" data-testid="button-date-to">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {filters.dateTo
              ? format(filters.dateTo, "dd/MM/yy", { locale: ptBR })
              : "Até"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={filters.dateTo}
            onSelect={(d) => updateFilter("dateTo", d)}
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
