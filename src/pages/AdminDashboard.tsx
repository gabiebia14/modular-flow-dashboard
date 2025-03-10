import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui-custom/Card";
import { AgentConfig } from "@/components/ui-custom/AgentConfig";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeftCircle, Bot, MessageSquare, Settings, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Agent } from "@/types/agent";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeAgent, setActiveAgent] = useState("atendimento");
  
  const agents: Agent[] = [
    {
      id: "atendimento",
      name: "Agente de Atendimento",
      icon: MessageSquare,
      description: "Coleta dados de clientes e gera orçamentos preliminares",
      prompt: "Você é um assistente de vendas da Modular Flow. Sua função é coletar informações dos clientes para gerar orçamentos. Pergunte sobre o tipo de produto, quantidade, localização de entrega, prazo e forma de pagamento."
    },
    {
      id: "orcamento",
      name: "Agente de Orçamento",
      icon: ShoppingBag,
      description: "Processa os dados e cria registros de orçamento no sistema",
      prompt: "Você é responsável por processar as informações coletadas pelo Agente de Atendimento e transformá-las em um orçamento estruturado. Organize os dados de forma clara e objetiva para o gerente de vendas."
    },
    {
      id: "email",
      name: "Agente de E-mail",
      icon: Bot,
      description: "Gera e envia e-mails com orçamentos para os clientes",
      prompt: "Você é responsável por criar e-mails profissionais com orçamentos anexados. Seu tom deve ser cordial, claro e profissional. Sempre inclua um resumo do orçamento no corpo do e-mail."
    }
  ];
  
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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {agents.map(agent => (
            <Card 
              key={agent.id} 
              className={`cursor-pointer ${activeAgent === agent.id ? "border-primary" : "border-border"}`}
              onClick={() => setActiveAgent(agent.id)}
              hover
            >
              <CardHeader>
                <div className={`w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2`}>
                  <agent.icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle>{agent.name}</CardTitle>
                <CardDescription>{agent.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
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
              <Button>
                <Settings className="h-4 w-4 mr-2" />
                Configurações Avançadas
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
                <Card className="border-dashed">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Chave de API</label>
                        <input type="password" placeholder="••••••••••••••••••••••" className="w-full border border-input bg-background rounded-md p-2" />
                        <p className="text-xs text-muted-foreground">A chave de API será armazenada de forma segura e não será compartilhada.</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Endpoint da API (opcional)</label>
                        <input type="text" placeholder="https://api.example.com/v1" className="w-full border border-input bg-background rounded-md p-2" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Timeout (ms)</label>
                        <input type="number" defaultValue="30000" className="w-full border border-input bg-background rounded-md p-2" />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">Salvar Configurações</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default AdminDashboard;
