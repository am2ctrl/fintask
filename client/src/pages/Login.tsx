import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Wallet, Lock } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const { signInWithEmail, user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  if (user) {
    setLocation("/");
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signInWithEmail(loginEmail, loginPassword);
    setLoading(false);
    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao entrar",
        description: error.message,
      });
    } else {
      setLocation("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Wallet className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">FinTask</CardTitle>
          <CardDescription>Gestao financeira familiar</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login" data-testid="tab-login">Entrar</TabsTrigger>
              <TabsTrigger value="signup" disabled data-testid="tab-signup" className="opacity-50 cursor-not-allowed">
                Criar Conta
              </TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    data-testid="input-login-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Senha</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="Sua senha"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    data-testid="input-login-password"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading} data-testid="button-login">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Entrar
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <div className="text-center py-8 space-y-4">
                <div className="flex justify-center">
                  <div className="p-4 rounded-full bg-muted">
                    <Lock className="w-8 h-8 text-muted-foreground" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="font-medium text-foreground">Cadastro restrito</p>
                  <p className="text-sm text-muted-foreground">
                    Este aplicativo e de uso privado. Novas contas so podem ser criadas por convite do administrador.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
