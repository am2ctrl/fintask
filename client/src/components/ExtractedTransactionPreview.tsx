import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Check, X, ChevronDown, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "./SummaryCard";
import { defaultCategories, type Category } from "./CategoryBadge";

export interface ExtractedTransaction {
  id: string;
  date: Date;
  description: string;
  amount: number;
  type: "income" | "expense";
  suggestedCategory: Category;
  confidence: number;
  selected: boolean;
}

interface ExtractedTransactionPreviewProps {
  transactions: ExtractedTransaction[];
  onTransactionsChange: (transactions: ExtractedTransaction[]) => void;
  onConfirm: (transactions: ExtractedTransaction[]) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ExtractedTransactionPreview({
  transactions,
  onTransactionsChange,
  onConfirm,
  onCancel,
  isLoading,
}: ExtractedTransactionPreviewProps) {
  const selectedCount = transactions.filter((t) => t.selected).length;
  const totalIncome = transactions
    .filter((t) => t.selected && t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.selected && t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const toggleAll = (selected: boolean) => {
    onTransactionsChange(transactions.map((t) => ({ ...t, selected })));
  };

  const toggleTransaction = (id: string) => {
    onTransactionsChange(
      transactions.map((t) =>
        t.id === id ? { ...t, selected: !t.selected } : t
      )
    );
  };

  const updateCategory = (id: string, categoryId: string) => {
    const category = defaultCategories.find((c) => c.id === categoryId);
    if (category) {
      onTransactionsChange(
        transactions.map((t) =>
          t.id === id ? { ...t, suggestedCategory: category } : t
        )
      );
    }
  };

  const updateType = (id: string, type: "income" | "expense") => {
    onTransactionsChange(
      transactions.map((t) => (t.id === id ? { ...t, type } : t))
    );
  };

  const filteredCategories = (type: "income" | "expense") =>
    defaultCategories.filter((c) => c.type === type);

  return (
    <Card className="overflow-hidden" data-testid="extracted-preview">
      <div className="p-4 border-b bg-muted/30">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h3 className="font-semibold">Transações Extraídas</h3>
            <p className="text-sm text-muted-foreground">
              {transactions.length} transações encontradas - {selectedCount} selecionadas
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-primary font-mono">
              +{formatCurrency(totalIncome)}
            </span>
            <span className="text-destructive font-mono">
              -{formatCurrency(totalExpense)}
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 border-b flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={selectedCount === transactions.length}
            onCheckedChange={(checked) => toggleAll(!!checked)}
            data-testid="checkbox-select-all"
          />
          <span className="text-sm">Selecionar todas</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Revise as categorias sugeridas
          </Badge>
        </div>
      </div>

      <div className="max-h-96 overflow-auto divide-y">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className={`p-4 flex items-center gap-4 ${
              transaction.selected ? "" : "opacity-50"
            }`}
            data-testid={`row-extracted-${transaction.id}`}
          >
            <Checkbox
              checked={transaction.selected}
              onCheckedChange={() => toggleTransaction(transaction.id)}
              data-testid={`checkbox-${transaction.id}`}
            />

            <div className="w-24 shrink-0 text-sm text-muted-foreground">
              {format(transaction.date, "dd/MM/yyyy", { locale: ptBR })}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {transaction.description}
              </p>
              {transaction.confidence < 0.7 && (
                <p className="text-xs text-amber-500 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Baixa confiança na classificação
                </p>
              )}
            </div>

            <Select
              value={transaction.type}
              onValueChange={(v) =>
                updateType(transaction.id, v as "income" | "expense")
              }
            >
              <SelectTrigger className="w-28" data-testid={`select-type-${transaction.id}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Receita</SelectItem>
                <SelectItem value="expense">Despesa</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={transaction.suggestedCategory.id}
              onValueChange={(v) => updateCategory(transaction.id, v)}
            >
              <SelectTrigger className="w-40" data-testid={`select-category-${transaction.id}`}>
                <SelectValue>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: transaction.suggestedCategory.color,
                      }}
                    />
                    <span className="truncate">
                      {transaction.suggestedCategory.name}
                    </span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {filteredCategories(transaction.type).map((cat) => (
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

            <span
              className={`w-28 text-right font-mono text-sm font-semibold ${
                transaction.type === "income"
                  ? "text-primary"
                  : "text-destructive"
              }`}
            >
              {transaction.type === "income" ? "+" : "-"}
              {formatCurrency(transaction.amount)}
            </span>
          </div>
        ))}
      </div>

      <div className="p-4 border-t bg-muted/30 flex items-center justify-between gap-4">
        <Button variant="ghost" onClick={onCancel} data-testid="button-cancel-import">
          <X className="w-4 h-4 mr-2" />
          Cancelar
        </Button>
        <Button
          onClick={() => onConfirm(transactions.filter((t) => t.selected))}
          disabled={selectedCount === 0 || isLoading}
          data-testid="button-confirm-import"
        >
          <Check className="w-4 h-4 mr-2" />
          Importar {selectedCount} transações
        </Button>
      </div>
    </Card>
  );
}
