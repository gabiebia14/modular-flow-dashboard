
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui-custom/Card";
import { ChatInterface } from "@/components/ui-custom/ChatInterface";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, FileText, BarChart, RefreshCw, Calendar } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Quote {
  id: string;
  date: Date;
  status: "pending" | "in_progress" | "approved" | "rejected";
  items: number;
  total?: number;
}

const ClientDashboard = () => {
  const [quotes, setQuotes] = useState<Quote[]>([
    {
      id: "QT-2023-001",
      date: new Date(2023, 5, 15),
      status: "pending",
      items: 5,
    },
    {
      id: "QT-2023-002",
      date: new Date(2023, 5, 10),
      status: "in_progress",
      items: 3,
      total: 15600,
    },
    {
      id: "QT-2023-003",
      date: new Date(2023, 5, 8),
      status: "approved",
      items: 2,
      total: 8400,
    },
  ]);
  
  const recentQuote = quotes[0];
  
  const statusConfig = {
    pending: { label: "Aguardando", color: "bg-yellow-500" },
    in_progress: { label: "Em Análise", color: "bg-blue-500" },
    approved: { label: "Aprovado", color: "bg-green-500" },
    rejected: { label: "Recusado", color: "bg-red-500" },
  };
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };
  
  const formatCurrency = (value?: number) => {
    if (value === undefined) return "-";
    return value.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    });
  };

  return (
    <MainLayout title="Atendimento ao Cliente" subtitle="Solicite orçamentos e acompanhe seu histórico">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChatInterface />
        </div>
        
        <div className="space-y-6">
          <Card glassmorphism>
            <CardHeader>
              <CardTitle className="text-lg">Resumo da Conta</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/40 rounded-lg p-4 text-center">
                  <p className="text-muted-foreground text-sm mb-1">Orçamentos</p>
                  <p className="text-2xl font-semibold">{quotes.length}</p>
                </div>
                <div className="bg-muted/40 rounded-lg p-4 text-center">
                  <p className="text-muted-foreground text-sm mb-1">Aprovados</p>
                  <p className="text-2xl font-semibold">{quotes.filter(q => q.status === "approved").length}</p>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">Último Orçamento</p>
                {recentQuote && (
                  <div className="border rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{recentQuote.id}</p>
                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(recentQuote.date)}</span>
                        </div>
                      </div>
                      <Badge className={cn(statusConfig[recentQuote.status].color)}>
                        {statusConfig[recentQuote.status].label}
                      </Badge>
                    </div>
                    <div className="mt-2 text-sm flex flex-wrap gap-2">
                      <div className="flex items-center gap-1">
                        <FileText className="h-3 w-3 text-muted-foreground" />
                        <span>{recentQuote.items} itens</span>
                      </div>
                      {recentQuote.total && (
                        <div className="flex items-center gap-1">
                          <BarChart className="h-3 w-3 text-muted-foreground" />
                          <span>{formatCurrency(recentQuote.total)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
            </CardFooter>
          </Card>
          
          <Card glassmorphism>
            <CardHeader>
              <CardTitle className="text-lg">Histórico de Orçamentos</CardTitle>
              <CardDescription>
                Acompanhe o status de todos os seus orçamentos
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0 py-0">
              <ScrollArea className="h-[300px]">
                <div className="divide-y">
                  {quotes.map((quote) => (
                    <div key={quote.id} className="p-4 hover:bg-muted/20 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{quote.id}</p>
                          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{formatDate(quote.date)}</span>
                          </div>
                        </div>
                        <Badge className={cn(statusConfig[quote.status].color)}>
                          {statusConfig[quote.status].label}
                        </Badge>
                      </div>
                      <div className="mt-2 text-sm flex justify-between items-center">
                        <div className="flex items-center gap-1">
                          <FileText className="h-3 w-3 text-muted-foreground" />
                          <span>{quote.items} itens</span>
                        </div>
                        <div className="font-medium">
                          {formatCurrency(quote.total)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter className="border-t p-4">
              <Button variant="outline" className="w-full">
                Ver Todos os Orçamentos
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default ClientDashboard;
