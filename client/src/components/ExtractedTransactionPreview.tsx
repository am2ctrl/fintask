import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Check, X, AlertTriangle, Wallet, CreditCard, RefreshCcw } from "lucide-react";
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
import { defaultCategories, type Category, CategoryIcon } from "./CategoryBadge";
import type { StatementType } from "./StatementUpload";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

export interface ExtractedTransaction {
  id: string;
  date: Date;
  description: string;
  amount: number;
  type: "income" | "expense";
  suggestedCategory: Category;
  confidence: number;
  selected: boolean;
  isRefund?: boolean;
}

interface ExtractedTransactionPreviewProps {
  transactions: ExtractedTransaction[];
  statementType: StatementType;
  onTransactionsChange: (transactions: ExtractedTransaction[]) => void;
  onConfirm: (transactions: ExtractedTransaction[]) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ExtractedTransactionPreview({
  transactions,
  statementType,
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
  const refundCount = transactions.filter((t) => t.isRefund).length;

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

  const statementInfo = statementType === "checking" 
    ? { icon: Wallet, label: "Conta Corrente", color: "text-chart-2", bg: "bg-chart-2/10" }
    : { icon: CreditCard, label: "Cartão de Crédito", color: "text-chart-3", bg: "bg-chart-3/10" };

  return (
    <Card className="overflow-hidden" data-testid="extracted-preview">
      <div className="p-4 border-b bg-muted/30">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${statementInfo.bg}`}>
              <statementInfo.icon className={`w-5 h-5 ${statementInfo.color}`} />
            </div>
            <div>
              <h3 className="font-semibold">Transações Extraídas</h3>
              <p className="text-sm text-muted-foreground">
                {statementInfo.label} - {transactions.length} transações encontradas
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {statementType === "credit_card" && refundCount > 0 && (
              <Badge variant="secondary" className="gap-1">
                <RefreshCcw className="w-3 h-3" />
                {refundCount} estorno{refundCount > 1 ? "s" : ""}
              </Badge>
            )}
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
      </div>

      <div className="p-4 border-b flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={selectedCount === transactions.length}
            onCheckedChange={(checked) => toggleAll(!!checked)}
            data-testid="checkbox-select-all"
          />
          <span className="text-sm">{selectedCount} de {transactions.length} selecionadas</span>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="secondary" className="text-xs cursor-help">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Revise as categorias sugeridas
                <HelpCircle className="w-3 h-3 ml-1" />
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs">
              <p className="font-medium">Por que revisar?</p>
              <p className="text-xs mt-1">
                A IA faz sugestões baseadas na descrição, mas você conhece melhor seus gastos.
                Clique na categoria para alterar se necessário.
              </p>
              <p className="text-xs mt-2">
                <strong>Fixa:</strong> Valores que se repetem todo mês (aluguel, assinaturas)
              </p>
              <p className="text-xs">
                <strong>Variável:</strong> Valores que mudam (supermercado, lazer)
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {statementType === "credit_card" && (
        <div className="p-3 bg-chart-3/5 border-b flex items-center gap-2 text-sm">
          <CreditCard className="w-4 h-4 text-chart-3" />
          <span className="text-muted-foreground">
            <strong>Dica:</strong> Em faturas de cartão, estornos e cashback aparecem como receitas (valores positivos).
          </span>
        </div>
      )}

      {statementType === "checking" && (
        <div className="p-3 bg-chart-2/5 border-b flex items-center gap-2 text-sm">
          <Wallet className="w-4 h-4 text-chart-2" />
          <span className="text-muted-foreground">
            <strong>Dica:</strong> PIX e TEDs recebidos aparecem como receitas, enviados como despesas.
          </span>
        </div>
      )}

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
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium truncate">
                  {transaction.description}
                </p>
                {transaction.isRefund && (
                  <Badge variant="outline" className="text-xs shrink-0">
                    <RefreshCcw className="w-3 h-3 mr-1" />
                    Estorno
                  </Badge>
                )}
              </div>
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
                <SelectItem value="income">
                  {statementType === "credit_card" ? "Estorno" : "Receita"}
                </SelectItem>
                <SelectItem value="expense">
                  {statementType === "credit_card" ? "Compra" : "Despesa"}
                </SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={transaction.suggestedCategory.id}
              onValueChange={(v) => updateCategory(transaction.id, v)}
            >
              <SelectTrigger className="w-44" data-testid={`select-category-${transaction.id}`}>
                <SelectValue>
                  <div className="flex items-center gap-2">
                    <CategoryIcon category={transaction.suggestedCategory} size="sm" />
                    <span className="truncate">
                      {transaction.suggestedCategory.name}
                    </span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {filteredCategories(transaction.type).map((cat) => {
                  const CatIcon = cat.icon;
                  return (
                    <SelectItem key={cat.id} value={cat.id}>
                      <div className="flex items-center gap-2">
                        <CatIcon className="w-4 h-4" style={{ color: cat.color }} />
                        <span>{cat.name}</span>
                      </div>
                    </SelectItem>
                  );
                })}
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
