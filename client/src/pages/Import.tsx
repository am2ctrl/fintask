import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { StatementUpload } from "@/components/StatementUpload";
import {
  ExtractedTransactionPreview,
  type ExtractedTransaction,
} from "@/components/ExtractedTransactionPreview";
import { defaultCategories, type Category } from "@/components/CategoryBadge";
import { apiRequest } from "@/lib/queryClient";

type ImportStep = "upload" | "preview" | "complete";

export default function Import() {
  const [step, setStep] = useState<ImportStep>("upload");
  const [extractedTransactions, setExtractedTransactions] = useState<ExtractedTransaction[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleUploadComplete = async (text: string, fileName: string) => {
    setIsProcessing(true);
    
    try {
      const response = await apiRequest("POST", "/api/extract-transactions", {
        text,
        fileName,
      });

      const data = await response.json();
      
      const transactions: ExtractedTransaction[] = data.transactions.map(
        (t: any, index: number) => {
          const category = defaultCategories.find(
            (c) => c.name.toLowerCase() === t.category?.toLowerCase()
          ) || defaultCategories.find((c) => c.type === t.type) || defaultCategories[4];

          return {
            id: `extracted-${index}`,
            date: new Date(t.date),
            description: t.description,
            amount: Math.abs(t.amount),
            type: t.type,
            suggestedCategory: category,
            confidence: t.confidence || 0.8,
            selected: true,
          };
        }
      );

      setExtractedTransactions(transactions);
      setStep("preview");
      
      toast({
        title: "Extração concluída",
        description: `${transactions.length} transações foram extraídas do extrato.`,
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
          Faça upload do seu extrato bancário e deixe a IA identificar as transações
        </p>
      </div>

      {step === "upload" && (
        <div className="max-w-2xl">
          <StatementUpload
            onUploadComplete={handleUploadComplete}
            isProcessing={isProcessing}
          />

          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">Como funciona?</h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Faça upload do extrato do seu banco (PDF, CSV, TXT ou OFX)</li>
              <li>Nossa IA analisa e extrai todas as transações automaticamente</li>
              <li>Revise as categorias sugeridas e faça ajustes se necessário</li>
              <li>Confirme para adicionar as transações ao seu histórico</li>
            </ol>
          </div>
        </div>
      )}

      {step === "preview" && (
        <ExtractedTransactionPreview
          transactions={extractedTransactions}
          onTransactionsChange={setExtractedTransactions}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}

      {step === "complete" && (
        <div className="max-w-2xl text-center py-12">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Importação Concluída!</h2>
          <p className="text-muted-foreground mb-6">
            Suas transações foram adicionadas com sucesso ao histórico.
          </p>
          <div className="flex items-center justify-center gap-4">
            <a href="/" className="text-primary hover:underline">
              Ver Dashboard
            </a>
            <button
              onClick={handleNewImport}
              className="text-primary hover:underline"
            >
              Importar outro extrato
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
