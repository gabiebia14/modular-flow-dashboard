
import { useState, useEffect } from "react";
import { Quote } from "@/types/agent";
import { toast } from "@/components/ui/use-toast";

export function useQuotes() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    setLoading(true);
    try {
      // Simular carregamento de orçamentos do backend
      // Em uma implementação real, isso viria do Supabase
      const mockQuotes: Quote[] = [
        {
          id: "ORC-2023-001",
          clientName: "Empresa ABC Ltda",
          clientEmail: "contato@empresaabc.com.br",
          clientPhone: "(11) 98765-4321",
          products: [
            {
              id: "prod-001",
              name: "Poste Circular",
              type: "Poste",
              subtype: "Circular",
              dimension: "09 / 0600",
              quantity: 10,
              unitPrice: 450.00,
            }
          ],
          location: "São Paulo, SP",
          deliveryDate: "2023-12-15",
          paymentMethod: "Boleto 30 dias",
          status: "pending",
          totalValue: 4500.00,
          createdAt: new Date("2023-11-15"),
          updatedAt: new Date("2023-11-15"),
        },
        {
          id: "ORC-2023-002",
          clientName: "Construtora XYZ",
          clientEmail: "compras@construtoraXYZ.com.br",
          clientPhone: "(11) 97654-3210",
          products: [
            {
              id: "prod-002",
              name: "Bloco Estrutural",
              type: "Bloco",
              subtype: "Estrutural",
              dimension: "14x19x39 cm",
              quantity: 2000,
              unitPrice: 2.75,
            },
            {
              id: "prod-003",
              name: "Canaleta",
              type: "Canaleta",
              dimension: "14x19x39 cm",
              quantity: 200,
              unitPrice: 3.50,
            }
          ],
          location: "Ribeirão Preto, SP",
          deliveryDate: "2023-12-05",
          paymentMethod: "Boleto 15/30/45 dias",
          status: "processing",
          totalValue: 6200.00,
          createdAt: new Date("2023-11-12"),
          updatedAt: new Date("2023-11-13"),
        },
        {
          id: "ORC-2023-003",
          clientName: "Indústria de Alimentos ABCD",
          clientEmail: "infra@abcd.com.br",
          products: [
            {
              id: "prod-004",
              name: "Aduela",
              type: "Aduela",
              dimension: "2,00M X 2,00M H1",
              quantity: 10,
              unitPrice: 3850.00,
            }
          ],
          location: "Campinas, SP",
          status: "completed",
          totalValue: 38500.00,
          createdAt: new Date("2023-11-10"),
          updatedAt: new Date("2023-11-11"),
        }
      ];
      
      setQuotes(mockQuotes);
      setError(null);
    } catch (err) {
      console.error("Erro ao carregar orçamentos:", err);
      setError("Não foi possível carregar os orçamentos. Por favor, tente novamente.");
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao carregar orçamentos.",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateQuote = async (updatedQuote: Quote) => {
    try {
      // Simular atualização no backend
      // Em uma implementação real, isso iria para o Supabase
      setQuotes(prev => 
        prev.map(quote => 
          quote.id === updatedQuote.id ? updatedQuote : quote
        )
      );
      
      toast({
        title: "Orçamento atualizado",
        description: `O orçamento ${updatedQuote.id} foi atualizado com sucesso.`,
      });
      
      return true;
    } catch (error) {
      console.error("Erro ao atualizar orçamento:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível atualizar o orçamento. Por favor, tente novamente.",
      });
      return false;
    }
  };

  const createQuote = async (newQuote: Omit<Quote, "id" | "createdAt" | "updatedAt" | "status">) => {
    try {
      // Gerar ID e datas para o novo orçamento
      const id = `ORC-${new Date().getFullYear()}-${String(quotes.length + 1).padStart(3, '0')}`;
      const now = new Date();
      
      const quote: Quote = {
        ...newQuote,
        id,
        status: "pending",
        createdAt: now,
        updatedAt: now,
      };
      
      // Adicionar à lista
      setQuotes(prev => [...prev, quote]);
      
      toast({
        title: "Orçamento criado",
        description: `O orçamento ${id} foi criado com sucesso.`,
      });
      
      return quote;
    } catch (error) {
      console.error("Erro ao criar orçamento:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível criar o orçamento. Por favor, tente novamente.",
      });
      return null;
    }
  };

  const getQuoteById = (id: string) => {
    return quotes.find(quote => quote.id === id);
  };

  return {
    quotes,
    loading,
    error,
    loadQuotes,
    updateQuote,
    createQuote,
    getQuoteById,
  };
}
