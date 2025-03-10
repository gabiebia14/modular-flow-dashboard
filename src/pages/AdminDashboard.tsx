
import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui-custom/Card";
import { AgentConfig } from "@/components/ui-custom/AgentConfig";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeftCircle, Bot, MessageSquare, Settings, ShoppingBag, 
  CheckCircle2, AlertCircle, Loader2, KeyRound, Server 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Agent, AgentDB, ApiKey } from "@/types/agent";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeAgent, setActiveAgent] = useState("atendimento");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [apiKey, setApiKey] = useState("");
  const [apiEndpoint, setApiEndpoint] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("openai");
  const [isSavingApiKey, setIsSavingApiKey] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: "atendimento",
      name: "Agente de Atendimento",
      description: "Coleta dados de clientes e gera orçamentos preliminares",
      prompt: "Você é um assistente de vendas da Modular Flow. Sua função é coletar informações dos clientes para gerar orçamentos. Pergunte sobre o tipo de produto, quantidade, localização de entrega, prazo e forma de pagamento.",
      model: "gpt-4o-mini",
      active: true,
      type: "atendimento",
      icon: MessageSquare
    },
    {
      id: "orcamento",
      name: "Agente de Orçamento",
      description: "Processa os dados e cria registros de orçamento no sistema",
      prompt: "Você é responsável por processar as informações coletadas pelo Agente de Atendimento e transformá-las em um orçamento estruturado. Organize os dados de forma clara e objetiva para o gerente de vendas.",
      model: "gpt-4o-mini",
      active: true,
      type: "orcamento",
      icon: ShoppingBag
    },
    {
      id: "email",
      name: "Agente de E-mail",
      description: "Gera e envia e-mails com orçamentos para os clientes",
      prompt: "Você é responsável por criar e-mails profissionais com orçamentos anexados. Seu tom deve ser cordial, claro e profissional. Sempre inclua um resumo do orçamento no corpo do e-mail.",
      model: "claude-3-haiku",
      active: false,
      type: "email",
      icon: Bot
    }
  ]);

  // Buscar agentes do Supabase ao carregar
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setIsLoading(true);
        const response = await supabase.functions.invoke('manage-agents', {
          body: { method: 'GET_ALL' }
        });

        if (response.data.success && response.data.data.length > 0) {
          // Converter os agentes do banco para o formato da interface
          const fetchedAgents = response.data.data.map((agent: AgentDB) => {
            let icon;
            switch (agent.type) {
              case 'atendimento': icon = MessageSquare; break;
              case 'orcamento': icon = ShoppingBag; break;
              case 'email': icon = Bot; break;
              default: icon = MessageSquare;
            }
            
            return {
              id: agent.agent_id,
              name: agent.name,
              description: agent.description || "",
              prompt: agent.prompt,
              model: agent.model as any,
              active: agent.active,
              type: agent.type as any,
              icon
            };
          });
          
          setAgents(fetchedAgents);
        }
      } catch (error) {
        console.error("Erro ao buscar agentes:", error);
        toast({
          title: "Erro ao carregar agentes",
          description: "Não foi possível recuperar os agentes do banco de dados.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgents();
  }, [toast]);

  const handleSaveConfig = async () => {
    const currentAgent = agents.find(a => a.id === activeAgent);
    if (!currentAgent) return;
    
    setIsSaving(true);
    
    try {
      // Preparar os dados para o formato do banco
      const agentData = {
        agent_id: currentAgent.id,
        name: currentAgent.name,
        description: currentAgent.description,
        prompt: currentAgent.prompt,
        model: currentAgent.model,
        active: currentAgent.active,
        type: currentAgent.type
      };
      
      // Verificar se o agente já existe no banco
      const response = await supabase.functions.invoke('manage-agents', {
        body: { 
          method: 'UPDATE',
          agentData
        }
      });
      
      if (response.data.success) {
        toast({
          title: "Configurações salvas",
          description: "As configurações do agente foram atualizadas com sucesso.",
          variant: "default",
        });
      } else {
        throw new Error(response.data.error || "Erro desconhecido");
      }
    } catch (error) {
      console.error("Erro ao salvar agente:", error);
      toast({
        title: "Erro ao salvar",
        description: `Não foi possível salvar as configurações: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleSaveApiKey = async () => {
    if (!apiKey || !selectedProvider) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSavingApiKey(true);
    
    try {
      const apiKeyData = {
        provider: selectedProvider,
        api_key: apiKey,
        endpoint: apiEndpoint || null,
        active: true
      };
      
      const response = await supabase.functions.invoke('manage-api-keys', {
        body: { 
          method: 'SAVE',
          apiKeyData
        }
      });
      
      if (response.data.success) {
        toast({
          title: "Chave de API salva",
          description: `A chave de API para ${selectedProvider} foi salva com sucesso.`,
          variant: "default",
        });
        
        // Limpar campos
        setApiKey("");
        setApiEndpoint("");
      } else {
        throw new Error(response.data.error || "Erro desconhecido");
      }
    } catch (error) {
      console.error("Erro ao salvar chave de API:", error);
      toast({
        title: "Erro ao salvar",
        description: `Não foi possível salvar a chave de API: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsSavingApiKey(false);
    }
  };
  
  const handleTestConnection = async () => {
    if (!selectedProvider) return;
    
    setIsTestingConnection(true);
    
    try {
      const response = await supabase.functions.invoke('manage-api-keys', {
        body: { 
          method: 'TEST_CONNECTION',
          apiKeyData: { provider: selectedProvider }
        }
      });
      
      if (response.data.success) {
        toast({
          title: "Conexão bem-sucedida",
          description: `A conexão com a API de ${selectedProvider} foi testada com sucesso.`,
          variant: "default",
        });
      } else {
        throw new Error("Falha no teste de conexão");
      }
    } catch (error) {
      console.error("Erro ao testar conexão:", error);
      toast({
        title: "Falha na conexão",
        description: `Não foi possível conectar à API de ${selectedProvider}. Verifique a chave e o endpoint.`,
        variant: "destructive",
      });
    } finally {
      setIsTestingConnection(false);
    }
  };
  
  // Função para obter o ícone do agente baseado no tipo
  const getAgentIcon = (type: string) => {
    switch(type) {
      case 'atendimento': return MessageSquare;
      case 'orcamento': return ShoppingBag;
      case 'email': return Bot;
      default: return MessageSquare;
    }
  };
  
  return (
    <MainLayout title="Painel Administrativo" subtitle="Configure agentes, personalize prompts e gerencie as configurações do sistema">
      <div className="space-y-6">
        <Button 
          variant="ghost" 
          className="w-fit flex items-center text-muted-foreground hover:text-foreground"
          onClick={() => navigate("/")}
        >
          <ArrowLeftCircle className="mr-2 h-4 w-4" />
          Voltar para o início
        </Button>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-lg">Carregando configurações...</span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {agents.map(agent => {
                const Icon = agent.icon || getAgentIcon(agent.type);
                return (
                  <Card 
                    key={agent.id} 
                    className={`cursor-pointer ${activeAgent === agent.id ? "border-primary" : "border-border"}`}
                    onClick={() => setActiveAgent(agent.id)}
                    hover="true"
                  >
                    <CardHeader>
                      <div className={`w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2`}>
                        {Icon && <Icon className="h-5 w-5 text-primary" />}
                      </div>
                      <CardTitle>{agent.name}</CardTitle>
                      <CardDescription>{agent.description}</CardDescription>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
            
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Configuração do Agente</CardTitle>
                    <CardDescription>
                      Personalize o comportamento do agente {agents.find(a => a.id === activeAgent)?.name.toLowerCase()}
                    </CardDescription>
                  </div>
                  <Button onClick={handleSaveConfig} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Salvar Configurações
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="prompts">
                  <TabsList className="mb-4">
                    <TabsTrigger value="prompts">Prompts</TabsTrigger>
                    <TabsTrigger value="model">Modelo LLM</TabsTrigger>
                    <TabsTrigger value="api">Configurações de API</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="prompts">
                    <AgentConfig 
                      agentName={agents.find(a => a.id === activeAgent)?.name || ""}
                      defaultPrompt={agents.find(a => a.id === activeAgent)?.prompt || ""}
                    />
                  </TabsContent>
                  
                  <TabsContent value="model">
                    <div className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Modelo de Linguagem</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Provedor</label>
                              <select className="w-full border border-input bg-background rounded-md p-2">
                                <option>OpenAI</option>
                                <option>Anthropic</option>
                                <option>Google</option>
                                <option>Perplexity</option>
                              </select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Modelo</label>
                              <select className="w-full border border-input bg-background rounded-md p-2">
                                <option>gpt-4o</option>
                                <option>gpt-4o-mini</option>
                                <option>claude-3-opus</option>
                                <option>claude-3-sonnet</option>
                              </select>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Parâmetros</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Temperatura</label>
                              <input type="range" min="0" max="1" step="0.1" defaultValue="0.7" className="w-full" />
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Determinístico</span>
                                <span>Criativo</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Maximum Length</label>
                              <input type="number" defaultValue="2048" className="w-full border border-input bg-background rounded-md p-2" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="api">
                    <div className="space-y-4">
                      <Card>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">Chaves de API</CardTitle>
                            <div className="flex items-center space-x-2 text-sm">
                              <AlertCircle className="h-4 w-4 text-amber-500" />
                              <span className="text-muted-foreground">As chaves são armazenadas de forma segura</span>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <Label>Provedor</Label>
                                <select 
                                  className="w-full border border-input bg-background rounded-md p-2"
                                  value={selectedProvider}
                                  onChange={(e) => setSelectedProvider(e.target.value)}
                                >
                                  <option value="openai">OpenAI</option>
                                  <option value="anthropic">Anthropic</option>
                                  <option value="google">Google</option>
                                </select>
                              </div>
                              <div className="space-y-2 md:col-span-2">
                                <Label>Chave de API</Label>
                                <Input 
                                  type="password" 
                                  placeholder="sk-..." 
                                  value={apiKey}
                                  onChange={(e) => setApiKey(e.target.value)}
                                />
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Endpoint da API (opcional)</Label>
                              <Input 
                                type="text" 
                                placeholder="https://api.example.com/v1" 
                                value={apiEndpoint}
                                onChange={(e) => setApiEndpoint(e.target.value)}
                              />
                              <p className="text-xs text-muted-foreground">
                                Deixe em branco para usar o endpoint padrão do provedor.
                              </p>
                            </div>
                            
                            <div className="flex justify-end space-x-2">
                              <Button 
                                variant="outline" 
                                onClick={handleTestConnection}
                                disabled={isTestingConnection || !selectedProvider}
                              >
                                {isTestingConnection ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Testando...
                                  </>
                                ) : (
                                  <>
                                    <Server className="h-4 w-4 mr-2" />
                                    Testar Conexão
                                  </>
                                )}
                              </Button>
                              <Button 
                                onClick={handleSaveApiKey}
                                disabled={isSavingApiKey || !apiKey || !selectedProvider}
                              >
                                {isSavingApiKey ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Salvando...
                                  </>
                                ) : (
                                  <>
                                    <KeyRound className="h-4 w-4 mr-2" />
                                    Salvar Chave
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default AdminDashboard;
