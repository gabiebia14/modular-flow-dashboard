
import { useState } from "react";
import { CalendarIcon, MoreHorizontal, FileText, RefreshCw, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent } from "./Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

type QuoteStatus = "pending" | "in_progress" | "approved" | "rejected";

interface QuoteItem {
  name: string;
  quantity: number;
  price?: number;
}

interface Quote {
  id: string;
  client: string;
  clientEmail: string;
  createdAt: Date;
  status: QuoteStatus;
  items: QuoteItem[];
  notes?: string;
  total?: number;
}

const statusConfig: Record<QuoteStatus, { label: string; color: string }> = {
  pending: { label: "Aguardando", color: "bg-yellow-500" },
  in_progress: { label: "Em Análise", color: "bg-blue-500" },
  approved: { label: "Aprovado", color: "bg-green-500" },
  rejected: { label: "Recusado", color: "bg-red-500" },
};

export const QuoteList = () => {
  const [quotes, setQuotes] = useState<Quote[]>([
    {
      id: "QT-2023-001",
      client: "Empresa ABC Ltda",
      clientEmail: "contato@empresaabc.com",
      createdAt: new Date(2023, 5, 15),
      status: "pending",
      items: [
        { name: "Produto A", quantity: 5, price: undefined },
        { name: "Produto B", quantity: 2, price: undefined },
      ],
    },
    {
      id: "QT-2023-002",
      client: "Construtora XYZ",
      clientEmail: "compras@construtoraxyz.com",
      createdAt: new Date(2023, 5, 10),
      status: "in_progress",
      items: [
        { name: "Produto C", quantity: 10, price: 1500 },
        { name: "Produto D", quantity: 3, price: 2200 },
      ],
      total: 21600,
    },
    {
      id: "QT-2023-003",
      client: "Indústria ZZZ",
      clientEmail: "financeiro@industriazzz.com",
      createdAt: new Date(2023, 5, 8),
      status: "approved",
      items: [
        { name: "Produto A", quantity: 8, price: 1200 },
        { name: "Produto E", quantity: 1, price: 5000 },
      ],
      total: 14600,
      notes: "Cliente solicitou entrega expressa",
    },
  ]);
  
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  
  const handleStatusChange = (quoteId: string, newStatus: QuoteStatus) => {
    setQuotes(quotes.map(quote => 
      quote.id === quoteId ? { ...quote, status: newStatus } : quote
    ));
  };
  
  const handlePriceUpdate = (quoteId: string, itemIndex: number, price: number) => {
    setEditingQuote(prev => {
      if (!prev) return null;
      
      const newItems = [...prev.items];
      newItems[itemIndex] = { ...newItems[itemIndex], price };
      
      const total = newItems.reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0);
      
      return { ...prev, items: newItems, total };
    });
  };
  
  const saveQuoteChanges = () => {
    if (!editingQuote) return;
    
    setQuotes(quotes.map(quote => 
      quote.id === editingQuote.id ? editingQuote : quote
    ));
    
    setEditingQuote(null);
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
    <Tabs defaultValue="all" className="w-full">
      <div className="flex justify-between items-center mb-4">
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="pending">Aguardando</TabsTrigger>
          <TabsTrigger value="in_progress">Em Análise</TabsTrigger>
          <TabsTrigger value="approved">Aprovados</TabsTrigger>
        </TabsList>
        
        <Button size="sm" className="gap-1">
          <RefreshCw className="h-4 w-4 mr-1" />
          Atualizar
        </Button>
      </div>
      
      <TabsContent value="all" className="mt-0">
        <Card>
          <CardContent className="p-0">
            <div className="rounded-md border">
              <div className="grid grid-cols-6 border-b bg-muted/50 p-3 text-sm font-medium">
                <div className="col-span-2">Orçamento / Cliente</div>
                <div className="col-span-1 text-center">Data</div>
                <div className="col-span-1 text-center">Status</div>
                <div className="col-span-1 text-center">Valor Total</div>
                <div className="col-span-1 text-center">Ações</div>
              </div>
              
              {quotes.map((quote) => (
                <div 
                  key={quote.id}
                  className="grid grid-cols-6 p-3 text-sm items-center border-b last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <div className="col-span-2 flex items-center gap-3">
                    <Avatar className="h-8 w-8 bg-primary/10 text-primary">
                      <FileText className="h-4 w-4" />
                    </Avatar>
                    <div>
                      <div className="font-medium">{quote.id}</div>
                      <div className="text-xs text-muted-foreground">{quote.client}</div>
                    </div>
                  </div>
                  
                  <div className="col-span-1 flex justify-center items-center gap-1 text-muted-foreground">
                    <CalendarIcon className="h-3 w-3" />
                    <span>{formatDate(quote.createdAt)}</span>
                  </div>
                  
                  <div className="col-span-1 text-center">
                    <Badge 
                      className={cn(
                        "font-normal",
                        statusConfig[quote.status].color,
                        quote.status === "rejected" && "bg-red-500"
                      )}
                    >
                      {statusConfig[quote.status].label}
                    </Badge>
                  </div>
                  
                  <div className="col-span-1 text-center font-medium">
                    {formatCurrency(quote.total)}
                  </div>
                  
                  <div className="col-span-1 flex justify-center">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedQuote(quote)}
                        >
                          Detalhes
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <span>Orçamento {selectedQuote?.id}</span>
                            <Badge 
                              className={cn(
                                "ml-2 font-normal",
                                selectedQuote && statusConfig[selectedQuote.status].color
                              )}
                            >
                              {selectedQuote && statusConfig[selectedQuote.status].label}
                            </Badge>
                          </DialogTitle>
                          <DialogDescription>
                            Cliente: {selectedQuote?.client} ({selectedQuote?.clientEmail})
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          <div className="rounded-md border">
                            <div className="grid grid-cols-7 bg-muted/50 p-2 text-sm font-medium border-b">
                              <div className="col-span-3">Produto</div>
                              <div className="col-span-1 text-center">Qtd</div>
                              <div className="col-span-1 text-center">Preço Unit.</div>
                              <div className="col-span-2 text-center">Subtotal</div>
                            </div>
                            
                            <ScrollArea className="max-h-[200px]">
                              {selectedQuote?.items.map((item, index) => (
                                <div 
                                  key={index}
                                  className="grid grid-cols-7 p-2 text-sm items-center border-b last:border-0"
                                >
                                  <div className="col-span-3">{item.name}</div>
                                  <div className="col-span-1 text-center">{item.quantity}</div>
                                  <div className="col-span-1 text-center">{formatCurrency(item.price)}</div>
                                  <div className="col-span-2 text-center font-medium">
                                    {item.price ? formatCurrency(item.price * item.quantity) : "-"}
                                  </div>
                                </div>
                              ))}
                            </ScrollArea>
                            
                            <div className="bg-muted/20 p-2 text-sm font-medium border-t flex justify-end">
                              <div className="w-1/3 grid grid-cols-1 gap-1">
                                <div className="flex justify-between">
                                  <span>Total:</span>
                                  <span>{formatCurrency(selectedQuote?.total)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {selectedQuote?.notes && (
                            <div className="bg-muted/20 p-3 rounded-md">
                              <h4 className="text-sm font-medium mb-1">Observações:</h4>
                              <p className="text-sm">{selectedQuote.notes}</p>
                            </div>
                          )}
                        </div>
                        
                        <DialogFooter className="gap-2 sm:gap-0">
                          {selectedQuote?.status === "pending" && (
                            <div className="flex gap-2 w-full sm:w-auto sm:justify-end">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    onClick={() => setEditingQuote(selectedQuote)}
                                  >
                                    Preencher Valores
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Preencher Valores do Orçamento</DialogTitle>
                                    <DialogDescription>
                                      Adicione os valores para cada item do orçamento.
                                    </DialogDescription>
                                  </DialogHeader>
                                  
                                  <div className="space-y-4">
                                    <div className="rounded-md border">
                                      <div className="grid grid-cols-7 bg-muted/50 p-2 text-sm font-medium border-b">
                                        <div className="col-span-3">Produto</div>
                                        <div className="col-span-1 text-center">Qtd</div>
                                        <div className="col-span-2 text-center">Preço Unit.</div>
                                        <div className="col-span-1 text-center">Subtotal</div>
                                      </div>
                                      
                                      {editingQuote?.items.map((item, index) => (
                                        <div 
                                          key={index}
                                          className="grid grid-cols-7 p-2 text-sm items-center border-b last:border-0"
                                        >
                                          <div className="col-span-3">{item.name}</div>
                                          <div className="col-span-1 text-center">{item.quantity}</div>
                                          <div className="col-span-2 text-center">
                                            <Input
                                              type="number"
                                              value={item.price || ""}
                                              onChange={(e) => handlePriceUpdate(
                                                editingQuote.id, 
                                                index, 
                                                parseFloat(e.target.value) || 0
                                              )}
                                              className="h-8"
                                              placeholder="0,00"
                                            />
                                          </div>
                                          <div className="col-span-1 text-center font-medium">
                                            {item.price ? formatCurrency(item.price * item.quantity) : "-"}
                                          </div>
                                        </div>
                                      ))}
                                      
                                      <div className="bg-muted/20 p-2 text-sm font-medium border-t flex justify-end">
                                        <div className="w-1/3 grid grid-cols-1 gap-1">
                                          <div className="flex justify-between">
                                            <span>Total:</span>
                                            <span>{formatCurrency(editingQuote?.total)}</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <Label htmlFor="notes">Observações</Label>
                                      <Input
                                        id="notes"
                                        value={editingQuote?.notes || ""}
                                        onChange={(e) => setEditingQuote(prev => 
                                          prev ? { ...prev, notes: e.target.value } : null
                                        )}
                                        className="mt-1"
                                      />
                                    </div>
                                  </div>
                                  
                                  <DialogFooter>
                                    <Button
                                      variant="outline"
                                      onClick={() => setEditingQuote(null)}
                                    >
                                      Cancelar
                                    </Button>
                                    <Button
                                      onClick={saveQuoteChanges}
                                      disabled={!editingQuote?.items.every(item => item.price !== undefined)}
                                    >
                                      Salvar Valores
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>
                          )}
                          
                          <div className="flex gap-2 w-full justify-between sm:w-auto">
                            <Button variant="outline">
                              Enviar por Email
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline">
                                  Alterar Status
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => selectedQuote && handleStatusChange(selectedQuote.id, "in_progress")}
                                >
                                  <div className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
                                  Em Análise
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => selectedQuote && handleStatusChange(selectedQuote.id, "approved")}
                                >
                                  <div className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                                  Aprovar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => selectedQuote && handleStatusChange(selectedQuote.id, "rejected")}
                                >
                                  <div className="w-2 h-2 rounded-full bg-red-500 mr-2" />
                                  Recusar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(quote.id, "approved")}
                          className="text-green-600"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Aprovar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(quote.id, "rejected")}
                          className="text-red-600"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Recusar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="pending" className="mt-0">
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-medium mb-4">Orçamentos Aguardando</h3>
            <div className="space-y-4">
              {quotes
                .filter(quote => quote.status === "pending")
                .map(quote => (
                  <Card key={quote.id} className="overflow-hidden" hover>
                    <div className="flex items-start justify-between p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10 bg-yellow-500/10 text-yellow-500">
                          <FileText className="h-5 w-5" />
                        </Avatar>
                        <div>
                          <div className="font-medium flex items-center">
                            {quote.id}
                            <Badge className="ml-2 bg-yellow-500 font-normal">
                              {statusConfig.pending.label}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">{quote.client}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <CalendarIcon className="h-3 w-3" />
                            <span>{formatDate(quote.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm">Preencher Valores</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Preencher Valores do Orçamento</DialogTitle>
                          </DialogHeader>
                          {/* Dialog Content */}
                        </DialogContent>
                      </Dialog>
                    </div>
                    
                    <Separator />
                    
                    <div className="p-4 bg-muted/20">
                      <h4 className="text-sm font-medium mb-2">Itens do Orçamento:</h4>
                      <ul className="space-y-1">
                        {quote.items.map((item, index) => (
                          <li key={index} className="text-sm flex items-center gap-2">
                            <span className="font-medium">{item.quantity}x</span>
                            <span>{item.name}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Card>
                ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="in_progress" className="mt-0">
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-medium mb-4">Orçamentos Em Análise</h3>
            {/* Similar content for in_progress quotes */}
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="approved" className="mt-0">
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-medium mb-4">Orçamentos Aprovados</h3>
            {/* Similar content for approved quotes */}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
