import { useState, useCallback } from "react";
import { Upload, FileText, X, Loader2, AlertCircle, Wallet, CreditCard, Lock, ArrowRight } from "lucide-react";
import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Progress } from "@/shared/components/ui/progress";
import { Input } from "@/shared/components/ui/input";
import { useToast } from "@/shared/hooks/use-toast";
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

export function StatementUpload({ onUploadComplete, isProcessing }: StatementUploadProps) {
  const [selectedType, setSelectedType] = useState<StatementType | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileText, setFileText] = useState<string | null>(null);
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
      verbosity: 0
    });

    try {
      const pdf = await loadingTask.promise;
      logger.debug("PDF loaded successfully, pages:", pdf.numPages);

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
      throw error;
    }
  };

  const loadFile = async (selectedFile: File, password?: string) => {
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
        setFileText(null);
        setProgress(0);
        return;
      }

      setFileText(text);

      toast({
        title: "Arquivo carregado",
        description: "Agora selecione o tipo de extrato para continuar.",
      });
    } catch (error: any) {
      logger.error("Error processing file:", error);

      const isPasswordError = error?.name === "PasswordException" ||
                             error?.message?.toLowerCase().includes("password") ||
                             error?.message?.toLowerCase().includes("senha");

      if (isPasswordError) {
        setPendingFile(selectedFile);
        setShowPasswordDialog(true);
        setFile(null);
        setFileText(null);
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
      setFileText(null);
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
      loadFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      loadFile(e.target.files[0]);
    }
  };

  const handleProcess = () => {
    if (!file || !fileText || !selectedType) return;
    onUploadComplete(fileText, file.name, selectedType);
  };

  const clearFile = () => {
    setFile(null);
    setFileText(null);
    setProgress(0);
    setSelectedType(null);
  };

  const handlePasswordSubmit = async () => {
    if (!pendingFile || !pdfPassword) {
      setPasswordError(true);
      return;
    }

    setShowPasswordDialog(false);
    setPasswordError(false);

    try {
      await loadFile(pendingFile, pdfPassword);
      setPendingFile(null);
      setPdfPassword("");
    } catch (error: any) {
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

  const hasFileLoaded = file && fileText && !uploading;

  return (
    <Card className="p-6" data-testid="statement-upload">
      <div className="mb-6">
        <h3 className="text-base font-medium">Importar Extrato</h3>
        <p className="text-sm text-muted-foreground">
          Faça upload do seu extrato bancário ou fatura de cartão
        </p>
      </div>

      {!hasFileLoaded ? (
        <div
          className={`
            border-2 border-dashed rounded-lg p-10 text-center transition-colors
            ${dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/40"}
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
            className="cursor-pointer flex flex-col items-center gap-4"
          >
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
              <Upload className="w-7 h-7 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-lg">Arraste seu arquivo aqui</p>
              <p className="text-sm text-muted-foreground mt-1">
                ou clique para selecionar
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="px-2 py-1 bg-muted rounded">PDF</span>
              <span className="px-2 py-1 bg-muted rounded">CSV</span>
              <span className="px-2 py-1 bg-muted rounded">TXT</span>
              <span className="px-2 py-1 bg-muted rounded">OFX</span>
            </div>
          </label>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Arquivo carregado */}
          <div className="flex items-center justify-between gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            {!isProcessing && (
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

          {/* Seleção de tipo */}
          <div className="space-y-3">
            <p className="text-sm font-medium">Que tipo de extrato é este?</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSelectedType("checking")}
                disabled={isProcessing}
                className={`
                  p-4 rounded-lg border-2 text-left transition-all
                  ${selectedType === "checking"
                    ? "border-chart-2 bg-chart-2/10"
                    : "border-border hover:border-chart-2/50 hover:bg-chart-2/5"}
                  ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}
                `}
                data-testid="button-type-checking"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${selectedType === "checking" ? "bg-chart-2/20" : "bg-muted"}`}>
                    <Wallet className={`w-5 h-5 ${selectedType === "checking" ? "text-chart-2" : "text-muted-foreground"}`} />
                  </div>
                  <div>
                    <p className={`font-medium text-sm ${selectedType === "checking" ? "text-chart-2" : ""}`}>
                      Conta Corrente
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PIX, TED, boletos
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setSelectedType("credit_card")}
                disabled={isProcessing}
                className={`
                  p-4 rounded-lg border-2 text-left transition-all
                  ${selectedType === "credit_card"
                    ? "border-chart-3 bg-chart-3/10"
                    : "border-border hover:border-chart-3/50 hover:bg-chart-3/5"}
                  ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}
                `}
                data-testid="button-type-credit_card"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${selectedType === "credit_card" ? "bg-chart-3/20" : "bg-muted"}`}>
                    <CreditCard className={`w-5 h-5 ${selectedType === "credit_card" ? "text-chart-3" : "text-muted-foreground"}`} />
                  </div>
                  <div>
                    <p className={`font-medium text-sm ${selectedType === "credit_card" ? "text-chart-3" : ""}`}>
                      Cartão de Crédito
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Fatura, parcelas
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Botão processar */}
          <Button
            onClick={handleProcess}
            disabled={!selectedType || isProcessing}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Extraindo transações...
              </>
            ) : (
              <>
                Processar Extrato
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>

          {isProcessing && (
            <Progress value={undefined} className="h-2" />
          )}
        </div>
      )}

      {/* Loading do arquivo */}
      {uploading && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Carregando arquivo...</span>
          </div>
          <Progress value={progress} className="h-2" />
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
