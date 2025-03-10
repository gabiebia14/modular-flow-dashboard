
import { useState } from "react";
import { Bell, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export const Header = ({ title, subtitle }: HeaderProps) => {
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Novo orçamento criado", time: "Agora" },
    { id: 2, text: "Cliente aguardando resposta", time: "5m atrás" }
  ]);

  const clearNotification = (id: number) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  return (
    <header className="border-b bg-glass sticky top-0 z-10 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      <div className="flex flex-col">
        <h1 className="text-xl font-semibold animate-slide-in">{title}</h1>
        {subtitle && <p className="text-muted-foreground text-sm animate-slide-in">{subtitle}</p>}
      </div>
      
      <div className="flex items-center space-x-2 sm:space-x-4">
        <div className="relative hidden sm:block w-56 lg:w-72 animate-fade-in">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Pesquisar..." 
            className="pl-8 bg-muted/50 border-none focus:ring-1 ring-primary/20"
          />
        </div>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative animate-fade-in">
              <Bell className="h-5 w-5" />
              {notifications.length > 0 && (
                <Badge 
                  className={cn(
                    "absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center",
                    "bg-primary text-primary-foreground"
                  )}
                >
                  {notifications.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="px-4 py-3 border-b">
              <h3 className="font-medium">Notificações</h3>
            </div>
            <div className="max-h-[300px] overflow-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-6 text-center text-muted-foreground">
                  Nenhuma notificação.
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="px-4 py-3 flex justify-between items-start hover:bg-muted/50 transition-all-subtle">
                      <div>
                        <p className="text-sm font-medium">{notification.text}</p>
                        <p className="text-xs text-muted-foreground">{notification.time}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => clearNotification(notification.id)}
                        className="text-xs h-6 hover:bg-muted"
                      >
                        Limpar
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
        
        <Button variant="ghost" size="icon" className="animate-fade-in">
          <User className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};
