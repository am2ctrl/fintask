import { useState, useCallback } from "react";
import { Upload, FileText, X, Loader2, AlertCircle, Wallet, CreditCard, HelpCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type StatementType = "checking" | "credit_card";

interface StatementUploadProps {
  onUploadComplete: (text: string, fileName: string, statementType: StatementType) => void;
  isProcessing?: boolean;
}

const statementTypes = [
  {
    id: "checking" as StatementType,
    title: "Conta Corrente",
    description: "Movimentações bancárias: PIX, TED, DOC, pagamentos, recebimentos",
    icon: Wallet,
    examples: ["Salários", "PIX recebidos/enviados", "Pagamentos de boletos", "Transferências"],
    color: "text-chart-2",
    bgColor: "bg-chart-2/10",
    borderColor: "border-chart-2/30",
  },
  {
    id: "credit_card" as StatementType,
    title: "Cartão de Crédito",
    description: "Fatura do cartão: compras, parcelas, estornos e reembolsos",
    icon: CreditCard,
    examples: ["Compras parceladas", "Assinaturas", "Estornos", "Cashback"],
    color: "text-chart-3",
    bgColor: "bg-chart-3/10",
    borderColor: "border-chart-3/30",
  },
];

export function StatementUpload({ onUploadComplete, isProcessing }: StatementUploadProps) {
  const [selectedType, setSelectedType] = useState<StatementType | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const processFile = async (selectedFile: File) => {
    if (!selectedType) {
      toast({
        title: "Selecione o tipo de extrato",
        description: "Por favor, escolha se é um extrato de conta corrente ou fatura de cartão.",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);
    setUploading(true);
    setProgress(0);

    try {
      const text = await selectedFile.text();
      
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 100);

      await new Promise((resolve) => setTimeout(resolve, 500));
      
      clearInterval(progressInterval);
      setProgress(100);

      onUploadComplete(text, selectedFile.name, selectedType);
      
      toast({
        title: "Arquivo carregado",
        description: `${selectedType === "checking" ? "Extrato de conta corrente" : "Fatura de cartão"} sendo processada...`,
      });
    } catch (error) {
      toast({
        title: "Erro ao carregar arquivo",
        description: "Não foi possível ler o arquivo. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, [selectedType]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const clearFile = () => {
    setFile(null);
    setProgress(0);
  };

  const resetAll = () => {
    setFile(null);
    setProgress(0);
    setSelectedType(null);
  };

  return (
    <Card className="p-6" data-testid="statement-upload">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-medium">Importar Extrato</h3>
          <p className="text-sm text-muted-foreground">
            Selecione o tipo de extrato para melhor classificação
          </p>
        </div>
        {selectedType && !file && (
          <Button variant="ghost" size="sm" onClick={resetAll}>
            Alterar tipo
          </Button>
        )}
      </div>

      {!selectedType ? (
        <div className="space-y-4">
          <p className="text-sm font-medium">Qual tipo de extrato você deseja importar?</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {statementTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`
                  p-5 rounded-lg border-2 text-left transition-all
                  hover-elevate active-elevate-2
                  ${type.borderColor} ${type.bgColor}
                `}
                data-testid={`button-type-${type.id}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg bg-background/50 ${type.color}`}>
                    <type.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{type.title}</h4>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="w-4 h-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <p className="font-medium mb-1">Exemplos:</p>
                          <ul className="text-xs space-y-0.5">
                            {type.examples.map((ex) => (
                              <li key={ex}>- {ex}</li>
                            ))}
                          </ul>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {type.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="p-4 bg-muted/50 rounded-lg mt-4">
            <p className="text-sm text-muted-foreground">
              <strong>Por que isso é importante?</strong> Cada tipo de extrato tem padrões diferentes. 
              Extratos bancários incluem transferências e pagamentos, enquanto faturas de cartão 
              focam em compras e parcelas. Isso ajuda a IA a classificar melhor suas transações.
            </p>
          </div>
        </div>
      ) : !file ? (
        <div className="space-y-4">
          <div className={`p-3 rounded-lg flex items-center gap-3 ${
            selectedType === "checking" ? "bg-chart-2/10" : "bg-chart-3/10"
          }`}>
            {selectedType === "checking" ? (
              <Wallet className="w-5 h-5 text-chart-2" />
            ) : (
              <CreditCard className="w-5 h-5 text-chart-3" />
            )}
            <span className="font-medium">
              {selectedType === "checking" ? "Extrato de Conta Corrente" : "Fatura de Cartão de Crédito"}
            </span>
          </div>

          <div
            className={`
              border-2 border-dashed rounded-lg p-8 text-center transition-colors
              ${dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"}
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".txt,.csv,.pdf,.ofx"
              onChange={handleChange}
              data-testid="input-file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center gap-3"
            >
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Upload className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">Arraste seu extrato aqui</p>
                <p className="text-sm text-muted-foreground">
                  ou clique para selecionar
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Formatos aceitos: PDF, CSV, TXT, OFX
              </p>
            </label>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className={`p-3 rounded-lg flex items-center gap-3 ${
            selectedType === "checking" ? "bg-chart-2/10" : "bg-chart-3/10"
          }`}>
            {selectedType === "checking" ? (
              <Wallet className="w-5 h-5 text-chart-2" />
            ) : (
              <CreditCard className="w-5 h-5 text-chart-3" />
            )}
            <span className="font-medium">
              {selectedType === "checking" ? "Extrato de Conta Corrente" : "Fatura de Cartão de Crédito"}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            {!uploading && !isProcessing && (
              <Button
                variant="ghost"
                size="icon"
                onClick={clearFile}
                data-testid="button-clear-file"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {(uploading || isProcessing) && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>
                  {uploading ? "Carregando arquivo..." : "Extraindo transações com IA..."}
                </span>
              </div>
              <Progress value={isProcessing ? undefined : progress} className="h-2" />
            </div>
          )}

          {!uploading && !isProcessing && progress === 100 && (
            <div className="flex items-center gap-2 text-sm text-primary">
              <AlertCircle className="w-4 h-4" />
              <span>Arquivo pronto para processamento</span>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
