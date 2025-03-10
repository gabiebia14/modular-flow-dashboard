import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, MessageCircle, FileText, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui-custom/Card";
import { cn } from "@/lib/utils";

const Index = () => {
  const navigate = useNavigate();
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimate(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const userTypes = [
    {
      title: "Cliente",
      description: "Acesse o sistema de atendimento para solicitar orçamentos e acompanhar pedidos.",
      icon: MessageCircle,
      path: "/client",
      color: "bg-blue-50 text-blue-500 dark:bg-blue-900/20 dark:text-blue-400"
    },
    {
      title: "Gerente de Vendas",
      description: "Visualize orçamentos, históricos de clientes e gerencie as vendas.",
      icon: FileText,
      path: "/manager",
      color: "bg-purple-50 text-purple-500 dark:bg-purple-900/20 dark:text-purple-400"
    },
    {
      title: "Administrador",
      description: "Configure agentes, personalize prompts e gerencie as configurações do sistema.",
      icon: Settings,
      path: "/admin",
      color: "bg-gray-50 text-gray-500 dark:bg-gray-800/40 dark:text-gray-400"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-background to-secondary/30">
      <div className="max-w-5xl w-full mx-auto space-y-12">
        <div className="text-center space-y-4">
          <div className={cn(
            "mb-8 opacity-0 transform translate-y-4 transition-all duration-700 ease-out",
            animate && "opacity-100 transform-none"
          )}>
            <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground mx-auto mb-4 shadow-lg">
              <span className="font-bold text-2xl">MF</span>
            </div>
          </div>
          
          <h1 className={cn(
            "text-4xl sm:text-5xl font-bold tracking-tight opacity-0 transform translate-y-4 transition-all duration-700 delay-100 ease-out",
            animate && "opacity-100 transform-none"
          )}>
            Modular Flow Dashboard
          </h1>
          
          <p className={cn(
            "text-xl text-muted-foreground max-w-2xl mx-auto opacity-0 transform translate-y-4 transition-all duration-700 delay-200 ease-out",
            animate && "opacity-100 transform-none"
          )}>
            Um sistema integrado para gerenciamento de atendimento ao cliente, orçamentos e vendas com fluxo modular e agentes verticais.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {userTypes.map((type, index) => (
            <Card 
              key={type.title} 
              className={cn(
                "border-2 hover:border-primary/50",
                animate && "opacity-100 transform-none",
                `opacity-0 transform translate-y-8 transition-all duration-700 ease-out delay-[${300 + index * 100}]`
              )}
              glassmorphism
              hover
              onClick={() => navigate(type.path)}
            >
              <CardHeader>
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center",
                  type.color
                )}>
                  <type.icon className="h-6 w-6" />
                </div>
                <CardTitle className="mt-4">{type.title}</CardTitle>
                <CardDescription>{type.description}</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button className="w-full group">
                  Acessar
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <footer className={cn(
          "text-center text-sm text-muted-foreground mt-8 opacity-0 transition-all duration-700 delay-700",
          animate && "opacity-100"
        )}>
          <p>© 2023 Modular Flow. Todos os direitos reservados.</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
