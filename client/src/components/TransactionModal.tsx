import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, HelpCircle, Lock, Shuffle } from "lucide-react";
import { ptBR } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { type Category, defaultCategories, expenseNatureInfo, NatureBadge } from "./CategoryBadge";
import type { Transaction } from "./TransactionItem";

interface TransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: Transaction | null;
  onSave: (data: Omit<Transaction, "id" | "category"> & { categoryId: string }) => void;
}

export function TransactionModal({
  open,
  onOpenChange,
  transaction,
  onSave,
}: TransactionModalProps) {
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (transaction) {
      setType(transaction.type);
      setAmount(transaction.amount.toString());
      setDate(transaction.date);
      setCategoryId(transaction.category.id);
      setDescription(transaction.description);
    } else {
      setType("expense");
      setAmount("");
      setDate(new Date());
      setCategoryId("");
      setDescription("");
    }
  }, [transaction, open]);

  const filteredCategories = defaultCategories.filter((c) => c.type === type);
  const selectedCategory = defaultCategories.find(c => c.id === categoryId);

  const handleSave = () => {
    if (!amount || !categoryId || !description) return;
    
    onSave({
      date,
      amount: parseFloat(amount),
      type,
      categoryId,
      description,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="modal-transaction">
        <DialogHeader>
          <DialogTitle>
            {transaction ? "Editar Transação" : "Nova Transação"}
          </DialogTitle>
          <DialogDescription>
            Preencha os dados da transação. Passe o mouse sobre os itens para ver dicas.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label>Tipo de Transação</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p className="font-medium">Receita vs Despesa</p>
                  <p className="text-xs mt-1">
                    <strong>Receita:</strong> Dinheiro que entra (salário, freelance, vendas)
                  </p>
                  <p className="text-xs mt-1">
                    <strong>Despesa:</strong> Dinheiro que sai (contas, compras, serviços)
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={type === "income" ? "default" : "outline"}
                className="flex-1"
                onClick={() => {
                  setType("income");
                  setCategoryId("");
                }}
                data-testid="button-type-income"
              >
                Receita
              </Button>
              <Button
                type="button"
                variant={type === "expense" ? "default" : "outline"}
                className="flex-1"
                onClick={() => {
                  setType("expense");
                  setCategoryId("");
                }}
                data-testid="button-type-expense"
              >
                Despesa
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="amount">Valor</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Digite o valor total da transação em reais.</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Use ponto ou vírgula para centavos. Ex: 150.50
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">
                R$
              </span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-10 text-xl font-mono"
                data-testid="input-amount"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Data</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  data-testid="button-date-picker"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(date, "dd/MM/yyyy", { locale: ptBR })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="category">Categoria</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p className="font-medium">Como escolher a categoria?</p>
                  <p className="text-xs mt-1">
                    Escolha a categoria que melhor descreve o tipo de gasto ou receita.
                    Isso ajuda a entender para onde vai seu dinheiro.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger data-testid="select-category">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" style={{ color: category.color }} />
                        <span>{category.name}</span>
                        {category.nature && (
                          <span className={`text-xs px-1.5 py-0.5 rounded ${
                            category.nature === "fixed" 
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" 
                              : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                          }`}>
                            {category.nature === "fixed" ? "Fixa" : "Var"}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            {selectedCategory?.description && (
              <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                {selectedCategory.description}
              </p>
            )}
          </div>

          {type === "expense" && (
            <div className="p-3 bg-muted/50 rounded-lg space-y-2">
              <p className="text-sm font-medium flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-500" />
                Despesa Fixa
                <Shuffle className="w-4 h-4 text-amber-500 ml-2" />
                Despesa Variável
              </p>
              <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                <div>
                  <p className="font-medium text-blue-600 dark:text-blue-400">Fixa:</p>
                  <p>{expenseNatureInfo.fixed.description}</p>
                </div>
                <div>
                  <p className="font-medium text-amber-600 dark:text-amber-400">Variável:</p>
                  <p>{expenseNatureInfo.variable.description}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p className="font-medium">Dica para descrição</p>
                  <p className="text-xs mt-1">
                    Seja específico! Em vez de "Compra", escreva "Supermercado Extra - compras do mês".
                    Isso facilita encontrar a transação depois.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Textarea
              id="description"
              placeholder="Descreva a transação... Ex: Supermercado Extra - compras da semana"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none"
              rows={3}
              data-testid="input-description"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            data-testid="button-cancel"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!amount || !categoryId || !description}
            data-testid="button-save"
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
