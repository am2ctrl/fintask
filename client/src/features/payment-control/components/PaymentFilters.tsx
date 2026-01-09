import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";

interface PaymentFiltersProps {
  filters: {
    search: string;
    accountId: string;
    statusFilter: string;
  };
  onFiltersChange: (filters: any) => void;
}

export function PaymentFilters({ filters, onFiltersChange }: PaymentFiltersProps) {
  const updateFilter = (key: string, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Pesquisar no período selecionado..."
          value={filters.search}
          onChange={(e) => updateFilter("search", e.target.value)}
          className="pl-9"
        />
      </div>

      <Select value={filters.accountId} onValueChange={(v) => updateFilter("accountId", v)}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Todas as contas" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as contas</SelectItem>
        </SelectContent>
      </Select>

      <Button variant="outline" size="sm">
        <SlidersHorizontal className="mr-2 h-4 w-4" />
        Mais filtros
      </Button>
    </div>
  );
}
