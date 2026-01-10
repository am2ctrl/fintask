import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, X, CreditCard, Receipt } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useToast } from "@/shared/hooks/use-toast";
import { apiRequest } from "@/shared/lib/queryClient";
import type { DeletionRequest } from "../contexts/FamilyContext";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DeletionRequestListProps {
  requests: DeletionRequest[];
  onUpdate: () => void;
}

export function DeletionRequestList({ requests, onUpdate }: DeletionRequestListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateRequestMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'approved' | 'rejected' }) => {
      const res = await apiRequest("PATCH", `/api/family-account/deletion-requests/${id}`, {
        status,
      });
      return res.json();
    },
    onSuccess: (_, { status }) => {
      toast({
        title: status === 'approved' ? "Solicitacao aprovada" : "Solicitacao rejeitada",
        description: status === 'approved'
          ? "O item foi excluido"
          : "O item foi mantido",
      });
      onUpdate();
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Nao foi possivel processar a solicitacao",
      });
    },
  });

  if (requests.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        Nenhuma solicitacao pendente
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((request) => (
        <div
          key={request.id}
          className="flex items-center justify-between p-3 border rounded-lg bg-background"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              {request.resourceType === 'transaction' ? (
                <Receipt className="w-4 h-4 text-muted-foreground" />
              ) : (
                <CreditCard className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
            <div>
              <div className="font-medium">
                {request.resourceName || "Item"}
              </div>
              <div className="text-sm text-muted-foreground">
                Solicitado por {request.requesterName} -{" "}
                {formatDistanceToNow(new Date(request.createdAt), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </div>
              {request.reason && (
                <div className="text-sm text-muted-foreground mt-1">
                  Motivo: {request.reason}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="text-destructive hover:text-destructive"
              onClick={() => updateRequestMutation.mutate({ id: request.id, status: 'rejected' })}
              disabled={updateRequestMutation.isPending}
            >
              <X className="w-4 h-4 mr-1" />
              Rejeitar
            </Button>
            <Button
              size="sm"
              onClick={() => updateRequestMutation.mutate({ id: request.id, status: 'approved' })}
              disabled={updateRequestMutation.isPending}
            >
              <Check className="w-4 h-4 mr-1" />
              Aprovar
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
