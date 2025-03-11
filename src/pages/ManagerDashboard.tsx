
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui-custom/Card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, AlertCircle, ArrowLeftCircle, ArrowRight, CheckCircle, Clock, FileText, Mail, PenLine, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuotes } from "@/hooks/use-quotes";
import { Quote } from "@/types/agent";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("pendentes");
  const { quotes, updateQuote } = useQuotes();
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editedValues, setEditedValues] = useState<Record<string, number>>({});
  const isMobile = useIsMobile();
  
  // Estatísticas para o dashboard
  const pendingCount = quotes.filter(q => q.status === "pending").length;
  const processingCount = quotes.filter(q => q.status === "processing").length;
  const completedCount = quotes.filter(q => q.status === "completed" || q.status === "approved" || q.status === "sent").length;
  const clientCount = new Set(quotes.map(q => q.clientEmail)).size;
  
  // Filtrar orçamentos por status
  const getFilteredQuotes = () => {
    switch (activeTab) {
      case "pendentes":
        return quotes.filter(q => q.status === "pending");
      case "em-processamento":
        return quotes.filter(q => q.status === "processing");
      case "concluidos":
        return quotes.filter(q => q.status === "completed" || q.status === "approved" || q.status === "sent");
      case "todos":
      default:
        return quotes;
    }
  };

  const handleEditQuote = (quote: Quote) => {
    setSelectedQuote(quote);
    // Inicializar os valores dos produtos
    const initialValues: Record<string, number> = {};
    quote.products.forEach(product => {
      initialValues[product.id] = product.unitPrice || 0;
    });
    setEditedValues(initialValues);
    setShowEditDialog(true);
  };

  const handleSaveQuote = async () => {
    if (!selectedQuote) return;
    
    // Atualizar os preços dos produtos
    const updatedProducts = selectedQuote.products.map(product => ({
      ...product,
      unitPrice: editedValues[product.id] || 0
    }));
    
    // Calcular o valor total
    const totalValue = updatedProducts.reduce(
      (sum, product) => sum + (product.unitPrice || 0) * product.quantity, 
      0
    );
    
    // Atualizar o orçamento
    const updatedQuote: Quote = {
      ...selectedQuote,
      products: updatedProducts,
      totalValue,
      status: "processing", // Mudar status para "em processamento"
      updatedAt: new Date()
    };
    
    const success = await updateQuote(updatedQuote);
    
    if (success) {
      setShowEditDialog(false);
      toast({
        title: "Orçamento atualizado",
        description: `Os valores do orçamento ${selectedQuote.id} foram atualizados com sucesso.`,
      });
    }
  };

  const handleApproveQuote = async (quote: Quote) => {
    const updatedQuote: Quote = {
      ...quote,
      status: "completed",
      updatedAt: new Date()
    };
    
    const success = await updateQuote(updatedQuote);
    
    if (success) {
      toast({
        title: "Orçamento aprovado",
        description: `O orçamento ${quote.id} foi aprovado com sucesso.`,
      });
    }
  };

  const handleSendQuote = async (quote: Quote) => {
    const updatedQuote: Quote = {
      ...quote,
      status: "sent",
      updatedAt: new Date()
    };
    
    const success = await updateQuote(updatedQuote);
    
    if (success) {
      toast({
        title: "Orçamento enviado",
        description: `O orçamento ${quote.id} foi enviado por e-mail para ${quote.clientEmail}.`,
      });
    }
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
    <MainLayout title="Gerenciamento de Orçamentos" subtitle="Visualize, revise e aprove orçamentos">
      <div className="space-y-6">
        <Button 
          variant="ghost" 
          className="w-fit flex items-center text-muted-foreground hover:text-foreground"
          onClick={() => navigate("/")}
        >
          <ArrowLeftCircle className="mr-2 h-4 w-4" />
          Voltar para o início
        </Button>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border shadow-subtle" hover>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-lg font-medium">Orçamentos Totais</p>
                  <p className="text-3xl font-bold mt-2">{quotes.length}</p>
                  <p className="text-sm text-muted-foreground mt-1">{pendingCount} novos esta semana</p>
                </div>
                <div className="rounded-full p-2 text-blue-500 bg-blue-100 dark:bg-blue-900/20">
                  <FileText className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border shadow-subtle" hover>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-lg font-medium">Aguardando Análise</p>
                  <p className="text-3xl font-bold mt-2">{pendingCount}</p>
                  <p className="text-sm text-muted-foreground mt-1">{pendingCount > 0 ? "Requer atenção" : "Nenhum pendente"}</p>
                </div>
                <div className="rounded-full p-2 text-yellow-500 bg-yellow-100 dark:bg-yellow-900/20">
                  <AlertCircle className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border shadow-subtle" hover>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-lg font-medium">Concluídos</p>
                  <p className="text-3xl font-bold mt-2">{completedCount}</p>
                  <p className="text-sm text-muted-foreground mt-1">{completedCount > 0 ? `${Math.round(completedCount/quotes.length*100)}% de conclusão` : "Nenhum concluído"}</p>
                </div>
                <div className="rounded-full p-2 text-green-500 bg-green-100 dark:bg-green-900/20">
                  <CheckCircle className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border shadow-subtle" hover>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-lg font-medium">Clientes Ativos</p>
                  <p className="text-3xl font-bold mt-2">{clientCount}</p>
                  <p className="text-sm text-muted-foreground mt-1">Desde o início</p>
                </div>
                <div className="rounded-full p-2 text-purple-500 bg-purple-100 dark:bg-purple-900/20">
                  <Users className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle>Orçamentos</CardTitle>
                <CardDescription>Gerencie todos os orçamentos em um só lugar</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Activity className="h-4 w-4 mr-2" />
                  Relatório
                </Button>
                <Button>
                  <FileText className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pendentes" onValueChange={setActiveTab}>
              <TabsList className={`mb-4 ${isMobile ? "flex w-full overflow-x-auto" : ""}`}>
                <TabsTrigger value="pendentes">Pendentes</TabsTrigger>
                <TabsTrigger value="em-processamento">Em Processamento</TabsTrigger>
                <TabsTrigger value="concluidos">Concluídos</TabsTrigger>
                <TabsTrigger value="todos">Todos</TabsTrigger>
              </TabsList>
              
              <TabsContent value={activeTab}>
                <div className="space-y-4">
                  {getFilteredQuotes().length === 0 ? (
                    <div className="text-center py-12 border rounded-lg">
                      <FileText className="mx-auto h-12 w-12 text-muted-foreground opacity-20" />
                      <p className="mt-4 text-muted-foreground">Nenhum orçamento encontrado</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {getFilteredQuotes().map((quote) => (
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
                              <p className="text-sm text-muted-foreground">{quote.clientName}</p>
                              <p className="text-xs text-muted-foreground">{quote.clientEmail}</p>
                            </div>
                            
                            <div className="md:col-span-2">
                              <div className="space-y-1">
                                {quote.products.slice(0, 2).map((product, idx) => (
                                  <p key={idx} className="line-clamp-1 text-sm">
                                    {product.quantity}x {product.name} {product.dimension && `(${product.dimension})`}
                                    {product.unitPrice && ` - ${(product.unitPrice * product.quantity).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}`}
                                  </p>
                                ))}
                                {quote.products.length > 2 && (
                                  <p className="text-xs text-muted-foreground">
                                    + {quote.products.length - 2} itens adicionais
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-2">
                                {getStatusBadge(quote.status)}
                                <p className="text-xs text-muted-foreground">
                                  {quote.location}
                                </p>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <p className="font-medium">
                                {quote.totalValue 
                                  ? quote.totalValue.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})
                                  : "Não valorizado"}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(quote.updatedAt).toLocaleDateString('pt-BR')}
                              </p>
                              
                              <div className="mt-2 flex justify-end gap-2">
                                {quote.status === "pending" && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleEditQuote(quote)}
                                  >
                                    <PenLine className="h-3 w-3 mr-1" />
                                    Valorizar
                                  </Button>
                                )}
                                
                                {quote.status === "processing" && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleApproveQuote(quote)}
                                  >
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Aprovar
                                  </Button>
                                )}
                                
                                {quote.status === "completed" && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleSendQuote(quote)}
                                  >
                                    <Mail className="h-3 w-3 mr-1" />
                                    Enviar Email
                                  </Button>
                                )}
                                
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => navigate(`/quote/${quote.id}`)}
                                >
                                  <ArrowRight className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      {/* Dialog para editar valores */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Valorizar Orçamento</DialogTitle>
            <DialogDescription>
              Adicione valores para cada produto do orçamento {selectedQuote?.id}.
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[400px] pr-4">
            <div className="space-y-4 py-2">
              {selectedQuote?.products.map((product) => (
                <div key={product.id} className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor={`price-${product.id}`} className="text-sm font-medium">
                      {product.name} {product.dimension && `(${product.dimension})`}
                    </Label>
                    <span className="text-sm text-muted-foreground">
                      Qtd: {product.quantity}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">R$</span>
                    <Input
                      id={`price-${product.id}`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={editedValues[product.id] || 0}
                      onChange={(e) => setEditedValues({
                        ...editedValues,
                        [product.id]: parseFloat(e.target.value) || 0
                      })}
                      className="flex-1"
                    />
                    
                    <div className="w-20 text-right text-sm">
                      {((editedValues[product.id] || 0) * product.quantity).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      })}
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="pt-4 border-t mt-6">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total:</span>
                  <span className="font-bold">
                    {selectedQuote?.products.reduce(
                      (sum, product) => sum + (editedValues[product.id] || 0) * product.quantity, 
                      0
                    ).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    })}
                  </span>
                </div>
              </div>
            </div>
          </ScrollArea>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancelar</Button>
            <Button onClick={handleSaveQuote}>Salvar valores</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default ManagerDashboard;
