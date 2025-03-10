
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui-custom/Card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeftCircle, Check, ExternalLink, FileText, Mail, Pencil, Save, Send, User } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { ChatInterface } from "@/components/ui-custom/ChatInterface";

const QuoteDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  
  // Dados de demonstração
  const quoteData = {
    id: id || "ORC-2023-001",
    client: "Empresa ABC Ltda",
    contact: "João Silva",
    email: "joao.silva@empresaabc.com.br",
    phone: "(11) 98765-4321",
    description: "10 Módulos estruturais com montagem",
    details: "Módulos de 3x6m com estrutura metálica galvanizada, fechamento em painel isotérmico, piso em compensado naval revestido com manta vinílica. Inclui instalações elétricas básicas (4 pontos por módulo) e hidráulicas (quando aplicável).",
    value: "R$ 45.000,00",
    date: "15/11/2023",
    validity: "15/12/2023",
    paymentTerms: "50% de entrada, 25% na entrega dos materiais, 25% na conclusão",
    deliveryTime: "30 dias após aprovação",
    status: "pending"
  };
  
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
  
  return (
    <MainLayout title={`Orçamento ${quoteData.id}`} subtitle="Visualize e edite os detalhes do orçamento">
      <div className="space-y-6">
        <Button 
          variant="ghost" 
          className="w-fit flex items-center text-muted-foreground hover:text-foreground"
          onClick={() => navigate("/manager")}
        >
          <ArrowLeftCircle className="mr-2 h-4 w-4" />
          Voltar para os orçamentos
        </Button>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {quoteData.id} {getStatusBadge(quoteData.status)}
                    </CardTitle>
                    <CardDescription>{quoteData.date}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={isEditing ? "default" : "outline"}
                      onClick={() => setIsEditing(!isEditing)}
                    >
                      {isEditing ? (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Salvar
                        </>
                      ) : (
                        <>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </>
                      )}
                    </Button>
                    <Button>
                      <Send className="mr-2 h-4 w-4" />
                      Enviar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <Tabs defaultValue="details">
                  <TabsList className="mb-4">
                    <TabsTrigger value="details">Detalhes</TabsTrigger>
                    <TabsTrigger value="client">Cliente</TabsTrigger>
                    <TabsTrigger value="history">Histórico</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="details">
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-medium mb-2">Descrição</h3>
                        {isEditing ? (
                          <textarea 
                            className="w-full border rounded-md p-2 bg-background" 
                            defaultValue={quoteData.description}
                            rows={2}
                          />
                        ) : (
                          <p>{quoteData.description}</p>
                        )}
                      </div>
                      
                      <div>
                        <h3 className="font-medium mb-2">Detalhes Técnicos</h3>
                        {isEditing ? (
                          <textarea 
                            className="w-full border rounded-md p-2 bg-background" 
                            defaultValue={quoteData.details}
                            rows={5}
                          />
                        ) : (
                          <p className="text-muted-foreground whitespace-pre-line">{quoteData.details}</p>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="font-medium mb-2">Valor Total</h3>
                          {isEditing ? (
                            <input 
                              type="text" 
                              className="w-full border rounded-md p-2 bg-background" 
                              defaultValue={quoteData.value}
                            />
                          ) : (
                            <p className="text-xl font-bold">{quoteData.value}</p>
                          )}
                        </div>
                        
                        <div>
                          <h3 className="font-medium mb-2">Validade</h3>
                          {isEditing ? (
                            <input 
                              type="date" 
                              className="w-full border rounded-md p-2 bg-background" 
                              defaultValue="2023-12-15"
                            />
                          ) : (
                            <p>{quoteData.validity}</p>
                          )}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="font-medium mb-2">Condições de Pagamento</h3>
                          {isEditing ? (
                            <textarea 
                              className="w-full border rounded-md p-2 bg-background" 
                              defaultValue={quoteData.paymentTerms}
                              rows={3}
                            />
                          ) : (
                            <p className="text-muted-foreground">{quoteData.paymentTerms}</p>
                          )}
                        </div>
                        
                        <div>
                          <h3 className="font-medium mb-2">Prazo de Entrega</h3>
                          {isEditing ? (
                            <input 
                              type="text" 
                              className="w-full border rounded-md p-2 bg-background" 
                              defaultValue={quoteData.deliveryTime}
                            />
                          ) : (
                            <p className="text-muted-foreground">{quoteData.deliveryTime}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="client">
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <User className="h-8 w-8" />
                        </div>
                        <div>
                          <h3 className="text-xl font-medium">{quoteData.client}</h3>
                          <p className="text-muted-foreground">Cliente desde Jan/2023</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="font-medium mb-2">Contato</h3>
                          <p>{quoteData.contact}</p>
                        </div>
                        
                        <div>
                          <h3 className="font-medium mb-2">E-mail</h3>
                          <p>{quoteData.email}</p>
                        </div>
                        
                        <div>
                          <h3 className="font-medium mb-2">Telefone</h3>
                          <p>{quoteData.phone}</p>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="font-medium mb-3 flex items-center justify-between">
                          Histórico de Compras
                          <Button variant="outline" size="sm">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Ver Completo
                          </Button>
                        </h3>
                        
                        <div className="space-y-2">
                          <div className="border rounded-md p-3">
                            <div className="flex justify-between">
                              <p className="font-medium">Pedido #2023-005</p>
                              <p className="text-sm text-muted-foreground">05/06/2023</p>
                            </div>
                            <p className="text-sm">5 módulos para escritório</p>
                            <p className="text-sm font-medium mt-1">R$ 27.500,00</p>
                          </div>
                          
                          <div className="border rounded-md p-3">
                            <div className="flex justify-between">
                              <p className="font-medium">Pedido #2023-002</p>
                              <p className="text-sm text-muted-foreground">12/03/2023</p>
                            </div>
                            <p className="text-sm">Estrutura metálica para depósito</p>
                            <p className="text-sm font-medium mt-1">R$ 18.900,00</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="history">
                    <div className="space-y-4">
                      <div className="relative border-l-2 pl-4 pb-4 ml-4">
                        <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-primary"></div>
                        <p className="text-sm text-muted-foreground">Hoje, 15:30</p>
                        <p className="font-medium">Orçamento revisado por Maria Oliveira</p>
                        <p className="text-sm text-muted-foreground">Alteração nos valores e condições de pagamento</p>
                      </div>
                      
                      <div className="relative border-l-2 pl-4 pb-4 ml-4">
                        <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-muted"></div>
                        <p className="text-sm text-muted-foreground">Hoje, 10:15</p>
                        <p className="font-medium">Orçamento criado por Sistema</p>
                        <p className="text-sm text-muted-foreground">Gerado automaticamente a partir do atendimento ao cliente</p>
                      </div>
                      
                      <div className="relative border-l-2 pl-4 pb-4 ml-4">
                        <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-muted"></div>
                        <p className="text-sm text-muted-foreground">Hoje, 09:45</p>
                        <p className="font-medium">Atendimento realizado por Agente Virtual</p>
                        <p className="text-sm text-muted-foreground">Cliente solicitou orçamento via chat</p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              
              <CardFooter>
                <div className="flex items-center justify-between w-full">
                  <Button variant="outline">
                    <FileText className="mr-2 h-4 w-4" />
                    Baixar PDF
                  </Button>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="secondary">
                      <Mail className="mr-2 h-4 w-4" />
                      Enviar E-mail
                    </Button>
                    <Button variant="default">
                      <Check className="mr-2 h-4 w-4" />
                      Aprovar Orçamento
                    </Button>
                  </div>
                </div>
              </CardFooter>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Assistente de Vendas</CardTitle>
                <CardDescription>Use o assistente para esclarecer dúvidas sobre este orçamento</CardDescription>
              </CardHeader>
              <CardContent>
                <ChatInterface 
                  welcomeMessage={`Olá! Estou aqui para ajudar com o orçamento ${quoteData.id}. Como posso auxiliar você?`}
                  placeholder="Pergunte algo sobre o orçamento..."
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  Gerar Contrato
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="mr-2 h-4 w-4" />
                  Lembrete ao Cliente
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <User className="mr-2 h-4 w-4" />
                  Agendar Visita
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default QuoteDetail;
