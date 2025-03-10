
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText, ArrowRight, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuoteListProps {
  status?: "pending" | "processing" | "completed" | "all";
}

export const QuoteList = ({ status = "all" }: QuoteListProps) => {
  // Dados de demonstração
  const mockQuotes = [
    {
      id: "ORC-2023-001",
      client: "Empresa ABC Ltda",
      description: "10 Módulos estruturais com montagem",
      value: "R$ 45.000,00",
      date: "2023-11-15",
      status: "pending",
      priority: "high"
    },
    {
      id: "ORC-2023-002",
      client: "Construtora XYZ",
      description: "Estrutura metálica para galpão industrial",
      value: "R$ 120.000,00",
      date: "2023-11-12",
      status: "processing",
      priority: "medium"
    },
    {
      id: "ORC-2023-003",
      client: "Indústria de Alimentos ABCD",
      description: "Sistema de esteiras modulares",
      value: "R$ 78.500,00",
      date: "2023-11-10",
      status: "completed",
      priority: "low"
    },
    {
      id: "ORC-2023-004",
      client: "Supermercados Silva",
      description: "Prateleiras e estruturas metálicas",
      value: "R$ 35.000,00",
      date: "2023-11-08",
      status: "processing",
      priority: "high"
    },
    {
      id: "ORC-2023-005",
      client: "Hospital Regional",
      description: "Módulos para expansão da ala de emergência",
      value: "R$ 250.000,00",
      date: "2023-11-05",
      status: "pending",
      priority: "urgent"
    }
  ];

  const filteredQuotes = status === "all" 
    ? mockQuotes 
    : mockQuotes.filter(quote => quote.status === status);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pendente</Badge>;
      case "processing":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Em Processamento</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Concluído</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch(priority) {
      case "urgent":
        return <Badge variant="destructive" className="text-xs">Urgente</Badge>;
      case "high":
        return <Badge variant="default" className="bg-orange-500 text-xs">Alta</Badge>;
      case "medium":
        return <Badge variant="secondary" className="text-xs">Média</Badge>;
      case "low":
        return <Badge variant="outline" className="text-xs">Baixa</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {filteredQuotes.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground opacity-20" />
          <p className="mt-4 text-muted-foreground">Nenhum orçamento encontrado</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredQuotes.map((quote) => (
            <div 
              key={quote.id}
              className="p-4 border rounded-lg hover:border-primary transition-colors flex items-center gap-4"
            >
              <div className="flex-shrink-0">
                <Checkbox id={`select-${quote.id}`} />
              </div>
              
              <div className="flex-grow grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="font-medium">{quote.id}</p>
                  <p className="text-sm text-muted-foreground">{quote.client}</p>
                </div>
                
                <div className="md:col-span-2">
                  <p className="line-clamp-1">{quote.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusBadge(quote.status)}
                    {getPriorityBadge(quote.priority)}
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-medium">{quote.value}</p>
                  <p className="text-sm text-muted-foreground">{new Date(quote.date).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
              
              <div className="flex-shrink-0">
                <Button variant="ghost" size="icon">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
