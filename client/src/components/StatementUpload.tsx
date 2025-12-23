import { useState, useCallback } from "react";
import { Upload, FileText, X, Loader2, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

interface StatementUploadProps {
  onUploadComplete: (extractedText: string, fileName: string) => void;
  isProcessing?: boolean;
}

export function StatementUpload({ onUploadComplete, isProcessing }: StatementUploadProps) {
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

      onUploadComplete(text, selectedFile.name);
      
      toast({
        title: "Arquivo carregado",
        description: "O extrato está sendo processado pela IA...",
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
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const clearFile = () => {
    setFile(null);
    setProgress(0);
  };

  return (
    <Card className="p-6" data-testid="statement-upload">
      <h3 className="text-base font-medium mb-4">Importar Extrato</h3>
      
      {!file ? (
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
      ) : (
        <div className="space-y-4">
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
