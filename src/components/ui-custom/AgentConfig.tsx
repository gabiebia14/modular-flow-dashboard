
import { useState } from "react";
import { Check, Copy, Edit, Save, Plus, Trash, Info } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "./Card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface Agent {
  id: string;
  name: string;
  description: string;
  prompt: string;
  model: "gpt-4o" | "gpt-4o-mini" | "claude-3-haiku" | "claude-3-sonnet";
  active: boolean;
  type: "atendimento" | "orcamento" | "validacao" | "email";
}

export const AgentConfig = () => {
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: "agent-001",
      name: "Agente de Atendimento",
      description: "Responsável pelo primeiro contato com o cliente, coleta dados e requisitos.",
      prompt: "Você é um assistente de vendas da IPT Teixeira, especializado em atendimento cordial e eficiente. Seu objetivo é coletar as seguintes informações: tipo de produto, quantidade, localização de entrega, prazo e forma de pagamento.\n\nSempre inicie com uma saudação cordial como \"Olá, sou o assistente de vendas da IPT Teixeira, como posso te ajudar hoje?\"\n\nApós coletar todas as informações necessárias, organize-as em formato JSON conforme o modelo a seguir...",
      model: "gpt-4o-mini",
      active: true,
      type: "atendimento",
    },
    {
      id: "agent-002",
      name: "Agente de Orçamento",
      description: "Processa as informações do atendimento e cria orçamentos.",
      prompt: "Você é um assistente responsável por processar informações de requisições de clientes e transformá-las em orçamentos estruturados. Sua função é receber dados em formato JSON e organizá-los em um formato de orçamento adequado.",
      model: "gpt-4o-mini",
      active: true,
      type: "orcamento",
    },
    {
      id: "agent-003",
      name: "Agente de Validação",
      description: "Auxilia o gerente na revisão e validação de orçamentos.",
      prompt: "Você é um assistente especializado em auxiliar gerentes na revisão de orçamentos. Sua função é verificar a completude e consistência das informações, sugerir melhorias e fornecer insights relevantes para a tomada de decisão.",
      model: "gpt-4o-mini",
      active: true,
      type: "validacao",
    },
    {
      id: "agent-004",
      name: "Agente de Email",
      description: "Envia orçamentos por email para os clientes.",
      prompt: "Você é responsável por criar emails profissionais e cordiais para envio de orçamentos aos clientes. Sua mensagem deve ser formal, agradecer o interesse, anexar o orçamento e informar os próximos passos para aprovação.",
      model: "claude-3-haiku",
      active: false,
      type: "email",
    },
  ]);
  
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(agents[0]);

  const handleEditAgent = (agent: Agent) => {
    setEditingAgent({ ...agent });
  };

  const handleSaveAgent = () => {
    if (!editingAgent) return;
    
    setAgents(agents.map(agent => 
      agent.id === editingAgent.id ? editingAgent : agent
    ));
    
    if (selectedAgent?.id === editingAgent.id) {
      setSelectedAgent(editingAgent);
    }
    
    setEditingAgent(null);
  };

  const handleCopyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    // In a real application, add toast notification here
  };

  const handleActivateAgent = (agentId: string, active: boolean) => {
    setAgents(agents.map(agent => 
      agent.id === agentId ? { ...agent, active } : agent
    ));
    
    if (selectedAgent?.id === agentId) {
      setSelectedAgent(prev => prev ? { ...prev, active } : null);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "atendimento": return "Atendimento";
      case "orcamento": return "Orçamento";
      case "validacao": return "Validação";
      case "email": return "Email";
      default: return type;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Card glassmorphism>
        <CardHeader>
          <CardTitle>Configuração de Agentes</CardTitle>
          <CardDescription>
            Personalize os agentes do sistema, defina comportamentos e selecione modelos de IA.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Agentes Disponíveis</h3>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" />
                  Novo Agente
                </Button>
              </div>
              
              <ScrollArea className="h-[500px] border rounded-lg">
                <div className="p-1">
                  {agents.map((agent) => (
                    <button
                      key={agent.id}
                      className={cn(
                        "w-full text-left px-3 py-3 rounded-md transition-all-subtle",
                        "border border-transparent hover:border-border mb-1 last:mb-0",
                        selectedAgent?.id === agent.id ? "bg-muted border-border" : "hover:bg-muted/50"
                      )}
                      onClick={() => setSelectedAgent(agent)}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-sm">{agent.name}</h3>
                        <Badge
                          variant={agent.active ? "default" : "outline"}
                          className={cn(
                            "text-xs",
                            !agent.active && "text-muted-foreground"
                          )}
                        >
                          {agent.active ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {agent.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-[10px] py-0 h-4">
                          {agent.model}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px] py-0 h-4">
                          {getTypeLabel(agent.type)}
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div className="lg:col-span-3">
              {selectedAgent && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">Detalhes do Agente</h3>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={selectedAgent.active}
                        onCheckedChange={(checked) => handleActivateAgent(selectedAgent.id, checked)}
                      />
                      <Label htmlFor="active" className="text-sm">
                        {selectedAgent.active ? "Ativo" : "Inativo"}
                      </Label>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditAgent(selectedAgent)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nome</Label>
                      <div className="bg-muted rounded-md px-3 py-2">
                        {selectedAgent.name}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Tipo</Label>
                      <div className="bg-muted rounded-md px-3 py-2 capitalize">
                        {getTypeLabel(selectedAgent.type)}
                      </div>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Descrição</Label>
                      <div className="bg-muted rounded-md px-3 py-2">
                        {selectedAgent.description}
                      </div>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <div className="flex items-center justify-between">
                        <Label>Modelo</Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Info className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs text-xs">
                                GPT-4o é o modelo mais avançado com maior capacidade de raciocínio.
                                GPT-4o-mini é mais rápido e econômico.
                                Claude-3 oferece alternativas com diferentes níveis de qualidade.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <div className="bg-muted rounded-md px-3 py-2">
                        {selectedAgent.model}
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Prompt do Agente</Label>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopyPrompt(selectedAgent.prompt)}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copiar
                      </Button>
                    </div>
                    <div className="bg-muted rounded-md p-3 text-sm font-mono whitespace-pre-wrap overflow-auto max-h-[280px]">
                      {selectedAgent.prompt}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Edit Agent Dialog */}
      {editingAgent && (
        <Card glassmorphism className="absolute inset-4 z-50 overflow-auto">
          <CardHeader className="sticky top-0 bg-card border-b z-10">
            <div className="flex items-center justify-between">
              <CardTitle>Editar Agente</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setEditingAgent(null)}
                  variant="outline"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSaveAgent}
                >
                  <Save className="h-4 w-4 mr-1" />
                  Salvar
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Agente</Label>
                <Input
                  id="name"
                  value={editingAgent.name}
                  onChange={(e) => setEditingAgent({ ...editingAgent, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
                <Select
                  value={editingAgent.type}
                  onValueChange={(value) => setEditingAgent({ 
                    ...editingAgent, 
                    type: value as "atendimento" | "orcamento" | "validacao" | "email" 
                  })}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="atendimento">Atendimento</SelectItem>
                    <SelectItem value="orcamento">Orçamento</SelectItem>
                    <SelectItem value="validacao">Validação</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  value={editingAgent.description}
                  onChange={(e) => setEditingAgent({ ...editingAgent, description: e.target.value })}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="model">Modelo</Label>
                <Select
                  value={editingAgent.model}
                  onValueChange={(value) => setEditingAgent({ 
                    ...editingAgent, 
                    model: value as "gpt-4o" | "gpt-4o-mini" | "claude-3-haiku" | "claude-3-sonnet" 
                  })}
                >
                  <SelectTrigger id="model">
                    <SelectValue placeholder="Selecione o modelo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4o">GPT-4o (Avançado)</SelectItem>
                    <SelectItem value="gpt-4o-mini">GPT-4o-mini (Rápido)</SelectItem>
                    <SelectItem value="claude-3-haiku">Claude-3-Haiku</SelectItem>
                    <SelectItem value="claude-3-sonnet">Claude-3-Sonnet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="active">Status</Label>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="active"
                      checked={editingAgent.active}
                      onCheckedChange={(checked) => setEditingAgent({ ...editingAgent, active: checked })}
                    />
                    <Label htmlFor="active" className="cursor-pointer">
                      {editingAgent.active ? "Ativo" : "Inativo"}
                    </Label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="prompt">Prompt do Agente</Label>
              <Textarea
                id="prompt"
                value={editingAgent.prompt}
                onChange={(e) => setEditingAgent({ ...editingAgent, prompt: e.target.value })}
                className="min-h-[300px] font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Use este prompt para definir o comportamento, tom e instruções específicas para o agente.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
