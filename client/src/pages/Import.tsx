import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { StatementUpload, type StatementType } from "@/components/StatementUpload";
import {
  ExtractedTransactionPreview,
  type ExtractedTransaction,
} from "@/components/ExtractedTransactionPreview";
import { defaultCategories, type Category } from "@/components/CategoryBadge";
import { apiRequest } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Wallet, CreditCard, Upload, CheckCircle2, FileSearch, Sparkles, Loader2 } from "lucide-react";
interface DbCategory {
  id: string;
  name: string;
  type: string;
  color: string;
  icon: string | null;
}
import { 
  Banknote, 
  Briefcase, 
  TrendingUp, 
  CircleDot,
  Utensils, 
  Car, 
  Home, 
  Heart, 
  GraduationCap, 
  Gamepad2, 
  Receipt, 
  ShoppingBag,
  type LucideIcon
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  "Banknote": Banknote,
  "Briefcase": Briefcase,
  "TrendingUp": TrendingUp,
  "Plus": CircleDot,
  "Utensils": Utensils,
  "Car": Car,
  "Home": Home,
  "Heart": Heart,
  "GraduationCap": GraduationCap,
  "Gamepad2": Gamepad2,
  "Receipt": Receipt,
  "ShoppingBag": ShoppingBag,
  "Laptop": Briefcase,
  "MoreHorizontal": CircleDot,
};

type ImportStep = "upload" | "preview" | "complete";

export default function Import() {
  const [step, setStep] = useState<ImportStep>("upload");
  const [extractedTransactions, setExtractedTransactions] = useState<ExtractedTransaction[]>([]);
  const [statementType, setStatementType] = useState<StatementType>("checking");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const { data: dbCategories = [], isLoading: loadingCategories } = useQuery<DbCategory[]>({
    queryKey: ["/api/categories"],
  });

  const mapDbCategoryToLocal = (dbCat: DbCategory): Category => ({
    id: dbCat.id,
    name: dbCat.name,
    type: dbCat.type as "income" | "expense",
    color: dbCat.color,
    icon: iconMap[dbCat.icon || ""] || CircleDot,
  });

  const findCategoryByName = (name: string, type: string): Category => {
    const normalizedName = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    const dbMatch = dbCategories.find(c => {
      const catName = c.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return catName === normalizedName || catName.includes(normalizedName) || normalizedName.includes(catName);
    });
    
    if (dbMatch) return mapDbCategoryToLocal(dbMatch);
    
    const typeMatch = dbCategories.find(c => c.type === type);
    if (typeMatch) return mapDbCategoryToLocal(typeMatch);
    
    const fallback = dbCategories[0];
    if (fallback) return mapDbCategoryToLocal(fallback);
    
    return defaultCategories.find(c => c.type === type) || defaultCategories[4];
  };

  const handleUploadComplete = async (text: string, fileName: string, type: StatementType) => {
    setStatementType(type);
    setIsProcessing(true);
    
    try {
      const response = await apiRequest("POST", "/api/extract-transactions", {
        text,
        fileName,
        statementType: type,
      });

      const data = await response.json();
      
      const transactions: ExtractedTransaction[] = data.transactions.map(
        (t: any, index: number) => {
          const category = findCategoryByName(t.category || "", t.type);

          const isRefund = type === "credit_card" && t.type === "income";

          return {
            id: `extracted-${index}`,
            date: new Date(t.date),
            description: t.description,
            amount: Math.abs(t.amount),
            type: t.type,
            suggestedCategory: category,
            confidence: t.confidence || 0.8,
            selected: true,
            isRefund,
          };
        }
      );

      setExtractedTransactions(transactions);
      setStep("preview");
      
      toast({
        title: "Extração concluída",
        description: `${transactions.length} transações foram extraídas do ${type === "checking" ? "extrato bancário" : "fatura do cartão"}.`,
      });
    } catch (error) {
      console.error("Error extracting transactions:", error);
      toast({
        title: "Erro na extração",
        description: "Não foi possível extrair as transações. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirm = async (transactions: ExtractedTransaction[]) => {
    try {
      const transactionsToSave = transactions.map((t) => ({
        date: t.date.toISOString(),
        amount: t.amount,
        type: t.type,
        categoryId: t.suggestedCategory.id,
        description: t.description,
        source: statementType,
      }));

      await apiRequest("POST", "/api/transactions/batch", {
        transactions: transactionsToSave,
      });

      toast({
        title: "Transações importadas",
        description: `${transactions.length} transações foram adicionadas com sucesso.`,
      });

      setStep("complete");
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as transações.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setExtractedTransactions([]);
    setStep("upload");
  };

  const handleNewImport = () => {
    setExtractedTransactions([]);
    setStep("upload");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Importar Extrato</h1>
        <p className="text-sm text-muted-foreground">
          Faça upload do seu extrato bancário ou fatura de cartão e deixe a IA identificar as transações
        </p>
      </div>

      {step === "upload" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <StatementUpload
              onUploadComplete={handleUploadComplete}
              isProcessing={isProcessing}
            />
          </div>

          <div className="space-y-4">
            <Card className="p-5">
              <h4 className="font-medium mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Como funciona
              </h4>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 text-sm font-medium">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-sm">Escolha o tipo</p>
                    <p className="text-xs text-muted-foreground">
                      Conta corrente ou cartão de crédito
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 text-sm font-medium">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-sm">Faça o upload</p>
                    <p className="text-xs text-muted-foreground">
                      Arraste ou selecione seu arquivo
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 text-sm font-medium">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-sm">Revise e ajuste</p>
                    <p className="text-xs text-muted-foreground">
                      Confira as categorias sugeridas pela IA
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 text-sm font-medium text-primary-foreground">
                    4
                  </div>
                  <div>
                    <p className="font-medium text-sm">Confirme</p>
                    <p className="text-xs text-muted-foreground">
                      Importe as transações selecionadas
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <h4 className="font-medium mb-3">Tipos de Extrato</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-chart-2/10">
                    <Wallet className="w-4 h-4 text-chart-2" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Conta Corrente</p>
                    <p className="text-xs text-muted-foreground">
                      PIX, TED, DOC, boletos, salários
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-chart-3/10">
                    <CreditCard className="w-4 h-4 text-chart-3" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Cartão de Crédito</p>
                    <p className="text-xs text-muted-foreground">
                      Compras, parcelas, estornos, cashback
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {step === "preview" && (
        <ExtractedTransactionPreview
          transactions={extractedTransactions}
          statementType={statementType}
          onTransactionsChange={setExtractedTransactions}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}

      {step === "complete" && (
        <Card className="max-w-2xl mx-auto text-center py-12 px-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Importação Concluída!</h2>
          <p className="text-muted-foreground mb-6">
            Suas transações do {statementType === "checking" ? "extrato bancário" : "cartão de crédito"} foram adicionadas com sucesso ao histórico.
          </p>
          <div className="flex items-center justify-center gap-4">
            <a href="/" className="text-primary hover:underline">
              Ver Dashboard
            </a>
            <span className="text-muted-foreground">|</span>
            <button
              onClick={handleNewImport}
              className="text-primary hover:underline"
            >
              Importar outro extrato
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}
