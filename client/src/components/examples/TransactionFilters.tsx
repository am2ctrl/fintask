import { useState } from "react";
import { TransactionFilters, type FilterState } from "../TransactionFilters";

export default function TransactionFiltersExample() {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    type: "all",
    categoryId: "all",
    dateFrom: undefined,
    dateTo: undefined,
  });

  return (
    <TransactionFilters
      filters={filters}
      onFiltersChange={(f) => {
        setFilters(f);
        console.log("Filters changed:", f);
      }}
    />
  );
}
