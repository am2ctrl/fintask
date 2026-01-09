import { Link, useLocation } from "wouter";
import { LayoutDashboard, ArrowLeftRight, Tags, Wallet, Upload, CreditCard, LogOut, User, Receipt } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/components/ui/sidebar";
import { Button } from "@/shared/components/ui/button";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Transações", url: "/transacoes", icon: ArrowLeftRight },
  { title: "Pagamentos", url: "/pagamentos", icon: Receipt },
  { title: "Cartões", url: "/cartoes", icon: CreditCard },
  { title: "Importar", url: "/importar", icon: Upload },
  { title: "Categorias", url: "/categorias", icon: Tags },
];

interface AppSidebarProps {
  onSignOut?: () => void;
  userEmail?: string;
}

export function AppSidebar({ onSignOut, userEmail }: AppSidebarProps) {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Wallet className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold">FinTask</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`nav-${item.title.toLowerCase()}`}
                  >
                    <Link href={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      {onSignOut && (
        <SidebarFooter className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <span className="text-sm text-muted-foreground truncate flex-1">
              {userEmail}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onSignOut}
            className="w-full justify-start"
            data-testid="button-signout"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
