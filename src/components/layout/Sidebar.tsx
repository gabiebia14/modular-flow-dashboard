
import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Home, MessageCircle, FileText, Settings, Users, LogOut, ChevronLeft, ChevronRight, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Sidebar as SidebarContainer, 
  SidebarContent, 
  SidebarFooter as SidebarFooterContainer, 
  SidebarHeader as SidebarHeaderContainer, 
  SidebarTrigger 
} from "@/components/ui/sidebar";

type SidebarLinkProps = {
  to: string;
  icon: React.ElementType;
  label: string;
  expanded: boolean;
  userType: "client" | "manager" | "admin";
  allowedUsers: Array<"client" | "manager" | "admin">;
};

const SidebarLink = ({ to, icon: Icon, label, expanded, userType, allowedUsers }: SidebarLinkProps) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  if (!allowedUsers.includes(userType)) return null;

  return (
    <NavLink 
      to={to} 
      className={({ isActive }) => cn(
        "flex items-center px-3 py-2 my-1 rounded-md transition-all-subtle group",
        isActive 
          ? "bg-primary text-primary-foreground" 
          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
      )}
    >
      <Icon className={cn("h-5 w-5", expanded ? "mr-3" : "mx-auto")} />
      {expanded && <span className="animate-fade-in">{label}</span>}
      {!expanded && (
        <div className="absolute left-full ml-2 rounded-md px-2 py-1 bg-popover text-popover-foreground shadow-md text-xs z-50 animate-fade-in opacity-0 group-hover:opacity-100 pointer-events-none">
          {label}
        </div>
      )}
    </NavLink>
  );
};

export const Sidebar = () => {
  const [expanded, setExpanded] = useState(true);
  const isMobile = useIsMobile();
  const [userType, setUserType] = useState<"client" | "manager" | "admin">("client");
  
  // Toggle between user types for demo purposes
  const toggleUserType = () => {
    if (userType === "client") setUserType("manager");
    else if (userType === "manager") setUserType("admin");
    else setUserType("client");
  };
  
  useEffect(() => {
    if (isMobile) {
      setExpanded(false);
    }
  }, [isMobile]);

  const sidebarLinks = [
    { to: "/", icon: Home, label: "Home", allowedUsers: ["client", "manager", "admin"] as Array<"client" | "manager" | "admin"> },
    { to: "/client", icon: MessageCircle, label: "Atendimento", allowedUsers: ["client"] as Array<"client" | "manager" | "admin"> },
    { to: "/manager", icon: FileText, label: "Orçamentos", allowedUsers: ["manager"] as Array<"client" | "manager" | "admin"> },
    { to: "/admin", icon: Settings, label: "Configuração", allowedUsers: ["admin"] as Array<"client" | "manager" | "admin"> },
    { to: "/clients", icon: Users, label: "Clientes", allowedUsers: ["manager", "admin"] as Array<"client" | "manager" | "admin"> }
  ];

  return (
    <div className={cn(
      "border-r bg-glass transition-all duration-300",
      expanded ? "w-64" : "w-16"
    )}>
      <SidebarHeaderContainer className="h-16 flex items-center px-4 border-b">
        <div className="flex items-center overflow-hidden w-full">
          {expanded ? (
            <div className="flex items-center animate-fade-in">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground mr-3">
                <span className="font-semibold">MF</span>
              </div>
              <span className="font-semibold text-lg">ModularFlow</span>
            </div>
          ) : (
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground mx-auto">
              <span className="font-semibold">MF</span>
            </div>
          )}
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="ml-auto text-muted-foreground hover:text-foreground"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </SidebarHeaderContainer>
      
      <SidebarContent className="px-3 py-4">
        <div className="space-y-1">
          {sidebarLinks.map((link) => (
            <SidebarLink 
              key={link.to} 
              to={link.to} 
              icon={link.icon} 
              label={link.label} 
              expanded={expanded}
              userType={userType}
              allowedUsers={link.allowedUsers}
            />
          ))}
        </div>
      </SidebarContent>
      
      <SidebarFooterContainer className="border-t px-3 py-4 mt-auto">
        {/* User type switch for demo purposes */}
        <Button 
          variant="outline" 
          size="sm"
          className="w-full mb-4"
          onClick={toggleUserType}
        >
          {expanded ? (
            <span className="capitalize">{userType} View</span>
          ) : (
            <Users className="h-4 w-4" />
          )}
        </Button>
        
        <Button 
          variant="ghost" 
          className={cn(
            "w-full text-muted-foreground hover:text-foreground",
            expanded ? "justify-start" : "justify-center"
          )}
        >
          <LogOut className="h-4 w-4" />
          {expanded && <span className="ml-2">Logout</span>}
        </Button>
      </SidebarFooterContainer>
      
      {/* Mobile menu trigger */}
      {isMobile && (
        <SidebarTrigger asChild>
          <Button 
            variant="outline" 
            size="icon"
            className="fixed bottom-4 right-4 z-50 rounded-full shadow-md"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </SidebarTrigger>
      )}
    </div>
  );
};
