import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Plus, Key, Trash2, Shield, User, Bell } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { useToast } from "@/shared/hooks/use-toast";
import { apiRequest } from "@/shared/lib/queryClient";
import { useFamily, type FamilyGroupMember, type DeletionRequest } from "../contexts/FamilyContext";
import { AddMemberModal } from "../components/AddMemberModal";
import { ResetPasswordModal } from "../components/ResetPasswordModal";
import { DeletionRequestList } from "../components/DeletionRequestList";

export function FamilySettingsPage() {
  const { familyGroup, members, isAdmin, pendingDeletionCount, refetch } = useFamily();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [resetPasswordMember, setResetPasswordMember] = useState<FamilyGroupMember | null>(null);

  const { data: deletionRequests = [] } = useQuery<DeletionRequest[]>({
    queryKey: ["/api/family-account/deletion-requests"],
    enabled: isAdmin,
  });

  const pendingRequests = deletionRequests.filter(r => r.status === 'pending');

  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const res = await apiRequest("DELETE", `/api/family-account/members/${memberId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/family-account"] });
      toast({
        title: "Membro removido",
        description: "O membro foi removido do grupo familiar",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Nao foi possivel remover o membro",
      });
    },
  });

  const handleRemoveMember = (member: FamilyGroupMember) => {
    if (confirm(`Tem certeza que deseja remover ${member.displayName} do grupo familiar?`)) {
      removeMemberMutation.mutate(member.id);
    }
  };

  if (!isAdmin) {
    return (
      <div className="container max-w-4xl py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
            <p className="text-muted-foreground">
              Apenas o administrador do grupo pode acessar as configuracoes da familia
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configuracoes da Familia</h1>
        <p className="text-muted-foreground">
          Gerencie os membros do seu grupo familiar
        </p>
      </div>

      {/* Family Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            {familyGroup?.name || "Minha Familia"}
          </CardTitle>
          <CardDescription>
            {members.length} membro(s) - Maximo de 5 membros (1 admin + 4 membros)
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Pending Deletion Requests */}
      {pendingRequests.length > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
              <Bell className="w-5 h-5" />
              Solicitacoes de Exclusao Pendentes
              <Badge variant="secondary" className="ml-2">
                {pendingRequests.length}
              </Badge>
            </CardTitle>
            <CardDescription className="text-orange-600 dark:text-orange-400">
              Membros solicitaram exclusao de itens que precisam da sua aprovacao
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DeletionRequestList
              requests={pendingRequests}
              onUpdate={() => {
                queryClient.invalidateQueries({ queryKey: ["/api/family-account/deletion-requests"] });
                queryClient.invalidateQueries({ queryKey: ["/api/family-account"] });
                queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
                queryClient.invalidateQueries({ queryKey: ["/api/credit-cards"] });
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Members List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Membros</CardTitle>
            <CardDescription>
              Gerencie os membros que tem acesso aos dados financeiros
            </CardDescription>
          </div>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            disabled={members.length >= 5}
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Membro
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    {member.role === 'admin' ? (
                      <Shield className="w-5 h-5 text-primary" />
                    ) : (
                      <User className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{member.displayName}</span>
                      <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                        {member.role === 'admin' ? 'Administrador' : 'Membro'}
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {member.email}
                    </span>
                  </div>
                </div>

                {member.role !== 'admin' && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setResetPasswordMember(member)}
                    >
                      <Key className="w-4 h-4 mr-2" />
                      Redefinir Senha
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleRemoveMember(member)}
                      disabled={removeMemberMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {members.length >= 5 && (
            <p className="mt-4 text-sm text-muted-foreground text-center">
              Limite maximo de membros atingido
            </p>
          )}
        </CardContent>
      </Card>

      {/* Permissions Info */}
      <Card>
        <CardHeader>
          <CardTitle>Sobre as Permissoes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Administrador
            </h4>
            <ul className="ml-6 mt-2 text-sm text-muted-foreground list-disc">
              <li>Acesso total ao sistema</li>
              <li>Pode criar, editar e excluir transacoes, cartoes e categorias</li>
              <li>Pode gerenciar membros do grupo</li>
              <li>Aprova ou rejeita solicitacoes de exclusao</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium flex items-center gap-2">
              <User className="w-4 h-4" />
              Membro
            </h4>
            <ul className="ml-6 mt-2 text-sm text-muted-foreground list-disc">
              <li>Visualiza todos os dados financeiros</li>
              <li>Pode criar transacoes e cartoes</li>
              <li>Pode editar apenas o que ele mesmo criou</li>
              <li>Para excluir, precisa solicitar aprovacao do administrador</li>
              <li>Nao pode gerenciar categorias</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <AddMemberModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSuccess={() => {
          refetch();
          setIsAddModalOpen(false);
        }}
      />

      {resetPasswordMember && (
        <ResetPasswordModal
          member={resetPasswordMember}
          open={!!resetPasswordMember}
          onOpenChange={(open) => !open && setResetPasswordMember(null)}
        />
      )}
    </div>
  );
}
