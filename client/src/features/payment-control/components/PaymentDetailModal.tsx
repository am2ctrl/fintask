import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatCurrency } from "@/features/dashboard/components/SummaryCard";
import type { Transaction } from "@/features/transactions/components/TransactionItem";

interface PaymentDetailModalProps {
  open: boolean;
  payment: Transaction | null;
  onOpenChange: (open: boolean) => void;
  onSave: (data: any) => void;
}

export function PaymentDetailModal({ open, payment, onOpenChange, onSave }: PaymentDetailModalProps) {
  if (!payment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do Pagamento</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações da transação */}
          <div>
            <h3 className="font-semibold mb-3">Informações da Transação</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-muted-foreground">Nome</Label>
                <p>{payment.name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Valor</Label>
                <p className="font-mono">{formatCurrency(payment.amount)}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Vencimento</Label>
                <p>{payment.dueDate ? format(payment.dueDate, "dd/MM/yyyy", { locale: ptBR }) : "-"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Categoria</Label>
                <p>{payment.category.name}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Informações de recorrência (se aplicável) */}
          {(payment.isRecurring || payment.mode === "parcelada") && (
            <>
              <div>
                <h3 className="font-semibold mb-3">Informações de Recorrência</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-muted-foreground">Tipo</Label>
                    <p>{payment.mode === "parcelada" ? "Parcelado" : "Recorrente"}</p>
                  </div>
                  {payment.installmentNumber && (
                    <div>
                      <Label className="text-muted-foreground">Parcela</Label>
                      <p>{payment.installmentNumber}/{payment.installmentsTotal}</p>
                    </div>
                  )}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Detalhes de pagamento */}
          <div>
            <h3 className="font-semibold mb-3">Detalhes de Pagamento</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-muted-foreground">Status</Label>
                <p>{payment.isPaid ? "Pago" : "Em Aberto"}</p>
              </div>
              {payment.isPaid && payment.date && (
                <div>
                  <Label className="text-muted-foreground">Data de Pagamento</Label>
                  <p>{format(payment.date, "dd/MM/yyyy", { locale: ptBR })}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Campo de observações */}
          <div>
            <h3 className="font-semibold mb-3">Observações</h3>
            <Textarea
              placeholder="Adicione observações sobre este pagamento..."
              value={payment.description || ""}
              rows={4}
              readOnly
            />
          </div>

          <Separator />

          {/* Seção de anexos */}
          <div>
            <h3 className="font-semibold mb-3">Anexos</h3>
            <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground">
              <p className="text-sm">Funcionalidade de anexos será implementada em versão futura</p>
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
