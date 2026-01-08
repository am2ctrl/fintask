import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, HelpCircle, Repeat, CreditCard, CircleDot, type LucideIcon } from "lucide-react";
import { ptBR } from "date-fns/locale";
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
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Calendar } from "@/shared/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import type { Transaction, TransactionMode } from "./TransactionItem";
import { transactionModeInfo } from "./TransactionItem";

interface CategoryOption {
  id: string;
  name: string;
  type: "income" | "expense";
  color: string;
  icon: LucideIcon;
  description?: string;
}

interface TransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: Transaction | null;
  categories?: CategoryOption[];
  onSave: (data: Omit<Transaction, "id" | "category"> & { categoryId: string }) => void;
}

export function TransactionModal({
  open,
  onOpenChange,
  transaction,
  categories = [],
  onSave,
}: TransactionModalProps) {
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [mode, setMode] = useState<TransactionMode>("avulsa");
  const [installmentNumber, setInstallmentNumber] = useState("1");
  const [installmentsTotal, setInstallmentsTotal] = useState("2");
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    if (transaction) {
      setType(transaction.type);
      setAmount(transaction.amount.toString());
      setDate(transaction.date);
      setCategoryId(transaction.category.id);
      setDescription(transaction.description);
      setMode(transaction.mode || "avulsa");
      setInstallmentNumber(transaction.installmentNumber?.toString() || "1");
      setInstallmentsTotal(transaction.installmentsTotal?.toString() || "2");
      setDueDate((transaction as any).dueDate ? new Date((transaction as any).dueDate) : undefined);
    } else {
      setType("expense");
      setAmount("");
      setDate(new Date());
      setCategoryId("");
      setDescription("");
      setMode("avulsa");
      setInstallmentNumber("1");
      setInstallmentsTotal("2");
      setDueDate(undefined);
    }
  }, [transaction, open]);

  const filteredCategories = categories.filter((c) => c.type === type);
  const selectedCategory = categories.find(c => c.id === categoryId);

  const handleSave = () => {
    if (!amount || !categoryId || !description) return;
    
    const parsedInstallmentNumber = parseInt(installmentNumber) || 1;
    const parsedInstallmentsTotal = parseInt(installmentsTotal) || 2;
    
    if (mode === "parcelada") {
      if (parsedInstallmentsTotal < 2 || parsedInstallmentsTotal > 48) return;
      if (parsedInstallmentNumber < 1 || parsedInstallmentNumber > parsedInstallmentsTotal) return;
    }
    
    onSave({
      date,
      amount: parseFloat(amount),
      type,
      categoryId,
      description,
      mode: type === "expense" ? mode : "avulsa",
      ...(mode === "parcelada" && type === "expense" ? {
        installmentNumber: parsedInstallmentNumber,
        installmentsTotal: parsedInstallmentsTotal,
      } : {}),
      ...(type === "expense" && dueDate ? { dueDate } : {}),
    } as any);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto" data-testid="modal-transaction">
        <DialogHeader>
          <DialogTitle>
            {transaction ? "Editar Transacao" : "Nova Transacao"}
          </DialogTitle>
          <DialogDescription>
            Preencha os dados da transacao. Passe o mouse sobre os icones para ver dicas.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label>Tipo de Transacao</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p className="font-medium">Receita vs Despesa</p>
                  <p className="text-xs mt-1">
                    <strong>Receita:</strong> Dinheiro que entra (salario, freelance, vendas)
                  </p>
                  <p className="text-xs mt-1">
                    <strong>Despesa:</strong> Dinheiro que sai (contas, compras, servicos)
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
                  setMode("avulsa");
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
              <Label htmlFor="title">Nome da {type === "income" ? "Receita" : "Despesa"}</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p className="font-medium">Dê um nome para identificar</p>
                  <p className="text-xs mt-1">
                    {type === "income"
                      ? "Ex: Salário Janeiro, Freelance Projeto X, Venda produto"
                      : "Ex: Aluguel, Conta de Luz, Supermercado, Netflix"}
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Input
              id="title"
              type="text"
              placeholder={type === "income" ? "Ex: Salário Janeiro" : "Ex: Conta de Luz"}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-base"
              data-testid="input-title"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="amount">Valor</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Digite o valor total da transacao em reais.</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Para parceladas, informe o valor da parcela.
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

          {type === "expense" && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>Data de Vencimento (Opcional)</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <p className="font-medium">Para que serve?</p>
                    <p className="text-xs mt-1">
                      Define quando esta despesa vence. Útil para contas recorrentes como aluguel,
                      cartão de crédito, internet, etc. Você receberá lembretes das próximas despesas a vencer.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    data-testid="button-due-date-picker"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar vencimento"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={(d) => setDueDate(d)}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
              {dueDate && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDueDate(undefined)}
                  className="text-xs"
                >
                  Limpar vencimento
                </Button>
              )}
            </div>
          )}

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
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Label>Tipo de Despesa</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-sm">
                    <p className="font-medium mb-2">Como classificar?</p>
                    <div className="space-y-2 text-xs">
                      <p>
                        <strong className="text-blue-500">Recorrente:</strong> Se repete todo mes com valor igual.
                        Ex: aluguel R$ 2.000, Netflix R$ 55, academia R$ 150.
                      </p>
                      <p>
                        <strong className="text-purple-500">Parcelada:</strong> Compra dividida em X vezes.
                        Ex: TV 10x de R$ 300, celular 12x de R$ 200.
                      </p>
                      <p>
                        <strong>Avulsa:</strong> Compra unica, pontual.
                        Ex: jantar R$ 120, presente R$ 80.
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant={mode === "avulsa" ? "default" : "outline"}
                  className="flex-col h-auto py-3 gap-1"
                  onClick={() => setMode("avulsa")}
                  data-testid="button-mode-avulsa"
                >
                  <CircleDot className="h-4 w-4" />
                  <span className="text-xs">Avulsa</span>
                </Button>
                <Button
                  type="button"
                  variant={mode === "parcelada" ? "default" : "outline"}
                  className="flex-col h-auto py-3 gap-1"
                  onClick={() => setMode("parcelada")}
                  data-testid="button-mode-parcelada"
                >
                  <CreditCard className="h-4 w-4" />
                  <span className="text-xs">Parcelada</span>
                </Button>
              </div>

              {mode !== "avulsa" && (
                <div className="p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
                  {transactionModeInfo[mode].description}
                </div>
              )}

              {mode === "parcelada" && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="installmentNumber" className="text-xs">Parcela Atual</Label>
                    <Input
                      id="installmentNumber"
                      type="number"
                      min="1"
                      max={installmentsTotal}
                      value={installmentNumber}
                      onChange={(e) => setInstallmentNumber(e.target.value)}
                      className="font-mono"
                      data-testid="input-installment-number"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="installmentsTotal" className="text-xs">Total de Parcelas</Label>
                    <Input
                      id="installmentsTotal"
                      type="number"
                      min="2"
                      max="48"
                      value={installmentsTotal}
                      onChange={(e) => setInstallmentsTotal(e.target.value)}
                      className="font-mono"
                      data-testid="input-installments-total"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
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
