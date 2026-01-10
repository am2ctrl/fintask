import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import { useToast } from "@/shared/hooks/use-toast";
import { apiRequest } from "@/shared/lib/queryClient";

interface RequestDeletionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resourceType: 'transaction' | 'credit_card';
  resourceId: string;
  resourceName: string;
  onSuccess?: () => void;
}

export function RequestDeletionModal({
  open,
  onOpenChange,
  resourceType,
  resourceId,
  resourceName,
  onSuccess,
}: RequestDeletionModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [reason, setReason] = useState("");

  const requestDeletionMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/family-account/deletion-requests", {
        resourceType,
        resourceId,
        reason: reason || undefined,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Solicitacao enviada",
        description: "O administrador sera notificado para aprovar a exclusao",
      });
      setReason("");
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Nao foi possivel enviar a solicitacao",
      });
    },
  });

  const resourceTypeLabel = resourceType === 'transaction' ? 'transacao' : 'cartao';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Solicitar Exclusao</DialogTitle>
          <DialogDescription>
            Voce esta solicitando a exclusao de: <strong>{resourceName}</strong>
            <br />
            Esta {resourceTypeLabel} so sera excluida apos aprovacao do administrador.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Motivo (opcional)</Label>
            <Textarea
              id="reason"
              placeholder="Explique por que deseja excluir este item..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            onClick={() => requestDeletionMutation.mutate()}
            disabled={requestDeletionMutation.isPending}
          >
            {requestDeletionMutation.isPending ? "Enviando..." : "Solicitar Exclusao"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
