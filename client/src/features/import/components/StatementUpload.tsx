import { useState, useCallback } from "react";
import { Upload, FileText, X, Loader2, AlertCircle, Wallet, CreditCard, HelpCircle, Lock } from "lucide-react";
import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Progress } from "@/shared/components/ui/progress";
import { Input } from "@/shared/components/ui/input";
import { useToast } from "@/shared/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import * as pdfjsLib from "pdfjs-dist";
import { logger } from '@/shared/lib/logger';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url
).toString();

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
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [pdfPassword, setPdfPassword] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [passwordError, setPasswordError] = useState(false);
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

  const extractTextFromPDF = async (file: File, password?: string): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();

    logger.debug("Attempting to load PDF...", { hasPassword: !!password });

    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      password: password || undefined,
      verbosity: 0 // Suprimir warnings do pdfjs
    });

    try {
      const pdf = await loadingTask.promise;
      logger.debug("PDF loaded successfully, pages:", pdf.numPages);

      // ✅ OTIMIZAÇÃO: Processar páginas em paralelo ao invés de sequencial
      const pagePromises: Promise<string>[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        pagePromises.push(
          pdf.getPage(i)
            .then(page => page.getTextContent())
            .then(content => content.items.map((item: any) => item.str).join(" "))
        );
      }

      const pages = await Promise.all(pagePromises);
      const fullText = pages.join("\n");

      logger.debug("Text extracted, length:", fullText.length);
      return fullText;
    } catch (error: any) {
      logger.error("Error in extractTextFromPDF:", error);
      logger.debug("Error details:", {
        name: error?.name,
        message: error?.message,
        code: error?.code
      });
      throw error;
    }
  };

  const processFile = async (selectedFile: File, password?: string) => {
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

    let progressInterval: NodeJS.Timeout | null = null;

    try {
      let text: string;

      progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 100);

      if (selectedFile.name.toLowerCase().endsWith(".pdf")) {
        text = await extractTextFromPDF(selectedFile, password);
      } else {
        text = await selectedFile.text();
      }

      setProgress(100);

      if (!text || text.trim().length < 50) {
        toast({
          title: "Arquivo vazio ou ilegível",
          description: "Não foi possível extrair texto do arquivo. Verifique se o PDF não está protegido ou escaneado.",
          variant: "destructive",
        });
        setFile(null);
        setProgress(0);
        return;
      }

      onUploadComplete(text, selectedFile.name, selectedType);

      toast({
        title: "Arquivo carregado",
        description: `${selectedType === "checking" ? "Extrato de conta corrente" : "Fatura de cartão"} sendo processada...`,
      });
    } catch (error: any) {
      logger.error("Error processing file:", error);
      logger.debug("Error name:", error?.name);
      logger.debug("Error message:", error?.message);

      // Detectar se é PasswordException
      const isPasswordError = error?.name === "PasswordException" ||
                             error?.message?.toLowerCase().includes("password") ||
                             error?.message?.toLowerCase().includes("senha");

      logger.debug("Is password error?", isPasswordError);

      if (isPasswordError) {
        logger.debug("Showing password dialog...");
        setPendingFile(selectedFile);
        setShowPasswordDialog(true);
        setFile(null);
        setProgress(0);
        if (progressInterval) {
          clearInterval(progressInterval);
        }
        setUploading(false);
        return;
      }

      toast({
        title: "Erro ao carregar arquivo",
        description: error?.message || "Não foi possível ler o arquivo. Tente novamente.",
        variant: "destructive",
      });
      setFile(null);
      setProgress(0);
    } finally {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
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
    setPendingFile(null);
    setPdfPassword("");
    setShowPasswordDialog(false);
    setPasswordError(false);
  };

  const handlePasswordSubmit = async () => {
    if (!pendingFile || !pdfPassword) {
      setPasswordError(true);
      return;
    }

    logger.debug("Processing file with password...");
    setShowPasswordDialog(false);
    setPasswordError(false);

    try {
      await processFile(pendingFile, pdfPassword);
      setPendingFile(null);
      setPdfPassword("");
      logger.debug("File processed successfully with password");
    } catch (error: any) {
      logger.error("Error in handlePasswordSubmit:", error);
      const isPasswordError = error?.name === "PasswordException" ||
                             error?.message?.toLowerCase().includes("password") ||
                             error?.message?.toLowerCase().includes("senha");

      if (isPasswordError) {
        setShowPasswordDialog(true);
        setPasswordError(true);
        toast({
          title: "Senha incorreta",
          description: "A senha fornecida está incorreta. Tente novamente.",
          variant: "destructive",
        });
      }
    }
  };

  const handleCancelPassword = () => {
    setShowPasswordDialog(false);
    setPendingFile(null);
    setPdfPassword("");
    setPasswordError(false);
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

      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              PDF Protegido por Senha
            </DialogTitle>
            <DialogDescription>
              Este arquivo PDF está protegido. Digite a senha para continuar o processamento.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Digite a senha do PDF"
                value={pdfPassword}
                onChange={(e) => {
                  setPdfPassword(e.target.value);
                  setPasswordError(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handlePasswordSubmit();
                  }
                }}
                className={passwordError ? "border-destructive" : ""}
                autoFocus
              />
              {passwordError && (
                <p className="text-sm text-destructive">
                  Por favor, digite a senha do PDF
                </p>
              )}
            </div>

            {pendingFile && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{pendingFile.name}</span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancelPassword}>
              Cancelar
            </Button>
            <Button onClick={handlePasswordSubmit}>
              Processar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
