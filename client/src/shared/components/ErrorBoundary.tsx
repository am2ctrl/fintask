import { Component, ReactNode } from "react";
import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { logger } from "@/shared/lib/logger";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log para console/monitoramento
    logger.error("Error Boundary caught error:", error, errorInfo);

    // TODO: Enviar para Sentry/monitoramento quando implementado
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/"; // Redireciona para home
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="max-w-md w-full p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-destructive" />
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-2">
                  Algo deu errado
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Ocorreu um erro inesperado. Tente recarregar a página.
                </p>
              </div>

              <Alert variant="destructive" className="text-left">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Detalhes do erro</AlertTitle>
                <AlertDescription className="mt-2 text-xs font-mono">
                  {this.state.error?.message || "Erro desconhecido"}
                </AlertDescription>
              </Alert>

              <div className="flex gap-2 w-full">
                <Button
                  onClick={this.handleReset}
                  className="flex-1"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Voltar ao Início
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="flex-1"
                >
                  Recarregar Página
                </Button>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
