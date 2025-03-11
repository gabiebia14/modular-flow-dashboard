
import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui-custom/Card";
import { Button } from "@/components/ui/button";
import { ChatInterface } from "@/components/ui-custom/ChatInterface";
import { MessageCircle, FileText, ArrowLeftCircle, Check, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuotes } from "@/hooks/use-quotes";
import { Quote } from "@/types/agent";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";

const ClientDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"chat" | "quotations">("chat");
  const { quotes, loading } = useQuotes();
  const [clientQuotes, setClientQuotes] = useState<Quote[]>([]);
  const isMobile = useIsMobile();

  // Simulação: Filtrar orçamentos para este cliente (normalmente seria feito com autenticação)
  useEffect(() => {
    // Filtramos baseando-se no e-mail do cliente (simulado)
    const clientEmail = "cliente@example.com";
    setClientQuotes(quotes.filter(q => q.clientEmail === clientEmail));
  }, [quotes]);

  const handleQuoteCreated = (quote: Quote) => {
    // Atualizar a lista local de orçamentos do cliente
    setClientQuotes(prev => [...prev, quote]);
    // Opcional: mudar para a aba de orçamentos após criar um novo
    setTimeout(() => {
      setActiveTab("quotations");
    }, 2000);
  };

  const getStatusBadge = (status: Quote["status"]) => {
    switch(status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Aguardando análise</Badge>;
      case "processing":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Em processamento</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Concluído</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Aprovado</Badge>;
      case "sent":
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Enviado</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  return (
    <MainLayout 
      title="Portal do Cliente" 
      subtitle="Solicite orçamentos e acompanhe seus pedidos"
    >
      <div className="flex flex-col space-y-6">
        <Button 
          variant="ghost" 
          className="w-fit flex items-center text-muted-foreground hover:text-foreground"
          onClick={() => navigate("/")}
        >
          <ArrowLeftCircle className="mr-2 h-4 w-4" />
          Voltar para o início
        </Button>
        
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-64 flex md:flex-col space-x-2 md:space-x-0 md:space-y-2">
            <Card 
              className={`flex-1 cursor-pointer ${activeTab === "chat" ? "border-primary" : "border-border"}`}
              onClick={() => setActiveTab("chat")}
              hover
            >
              <CardHeader className="p-4">
                <div className="flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2 text-primary" />
                  <CardTitle className="text-sm">Atendimento</CardTitle>
                </div>
              </CardHeader>
            </Card>
            
            <Card 
              className={`flex-1 cursor-pointer ${activeTab === "quotations" ? "border-primary" : "border-border"}`}
              onClick={() => setActiveTab("quotations")}
              hover
            >
              <CardHeader className="p-4">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-primary" />
                  <CardTitle className="text-sm">Meus Orçamentos</CardTitle>
                </div>
              </CardHeader>
            </Card>
          </div>
          
          <div className="flex-1">
            {activeTab === "chat" ? (
              <Card glassmorphism>
                <CardHeader>
                  <CardTitle>Assistente de Vendas</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChatInterface 
                    welcomeMessage="Olá, sou o assistente de vendas da IPT Teixeira. Como posso te ajudar hoje? Estou aqui para fornecer informações sobre nossos produtos e ajudar com orçamentos."
                    placeholder="Digite sua mensagem aqui..."
                    agentType="atendimento"
                    onQuoteCreated={handleQuoteCreated}
                  />
                </CardContent>
              </Card>
            ) : (
              <Card glassmorphism>
                <CardHeader>
                  <CardTitle>Meus Orçamentos</CardTitle>
                </CardHeader>
                <CardContent>
                  {clientQuotes.length > 0 ? (
                    <div className="space-y-4">
                      {clientQuotes.map((quote) => (
                        <div 
                          key={quote.id}
                          className="border rounded-lg p-4 hover:border-primary transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{quote.id}</h3>
                              <p className="text-sm text-muted-foreground">
                                Criado em: {quote.createdAt.toLocaleDateString('pt-BR')}
                              </p>
                              
                              <div className="mt-3 space-y-1">
                                {quote.products.map((product, idx) => (
                                  <p key={idx} className="text-sm">
                                    {product.quantity}x {product.name} {product.dimension && `(${product.dimension})`}
                                  </p>
                                ))}
                              </div>
                              
                              <div className="mt-4 flex items-center space-x-2">
                                {getStatusBadge(quote.status)}
                                
                                {quote.status === "pending" && (
                                  <div className="flex items-center text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3 mr-1" />
                                    <span>Aguardando análise</span>
                                  </div>
                                )}
                                
                                {quote.status === "completed" && (
                                  <div className="flex items-center text-xs text-green-700">
                                    <Check className="h-3 w-3 mr-1" />
                                    <span>Aprovado</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div>
                              {quote.totalValue && (
                                <p className="font-medium text-right">
                                  {quote.totalValue.toLocaleString('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL'
                                  })}
                                </p>
                              )}
                              
                              <div className="mt-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => navigate(`/quote/${quote.id}`)}
                                >
                                  Ver detalhes
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                      <p>Você ainda não possui orçamentos.</p>
                      <p className="text-sm mt-2">Utilize nosso atendimento para solicitar um orçamento personalizado.</p>
                    </div>
                  )}
                </CardContent>
                {clientQuotes.length === 0 && (
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      onClick={() => setActiveTab("chat")}
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Solicitar Orçamento
                    </Button>
                  </CardFooter>
                )}
              </Card>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ClientDashboard;
