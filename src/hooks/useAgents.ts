
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";
import { Agent, AgentDB } from "@/types/agent";
import { Bot, MessageSquare, ShoppingBag } from "lucide-react";

export const useAgents = () => {
  const { toast } = useToast();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null);

  const getAgentIcon = (type: string) => {
    switch(type) {
      case 'atendimento': return MessageSquare;
      case 'orcamento': return ShoppingBag;
      case 'email': return Bot;
      default: return MessageSquare;
    }
  };

  const fetchAgents = async () => {
    try {
      setIsLoading(true);
      const response = await supabase.functions.invoke('manage-agents', {
        body: { method: 'GET_ALL' }
      });

      if (response.data.success && response.data.data.length > 0) {
        // Converter os agentes do banco para o formato da interface
        const fetchedAgents = response.data.data.map((agent: AgentDB) => {
          return {
            id: agent.agent_id,
            name: agent.name,
            description: agent.description || "",
            prompt: agent.prompt,
            model: agent.model as any,
            active: agent.active,
            type: agent.type as any,
            icon: getAgentIcon(agent.type)
          };
        });
        
        setAgents(fetchedAgents);
        
        // Set first agent as active if none is selected
        if (fetchedAgents.length > 0 && !activeAgentId) {
          setActiveAgentId(fetchedAgents[0].id);
        }
      } else {
        // Fall back to default agents if none are found in the database
        const defaultAgents: Agent[] = [
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
        ];
        
        setAgents(defaultAgents);
        
        if (defaultAgents.length > 0) {
          setActiveAgentId(defaultAgents[0].id);
        }
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

  const saveAgent = async (agent: Agent) => {
    // Preparar os dados para o formato do banco
    const agentData = {
      agent_id: agent.id,
      name: agent.name,
      description: agent.description,
      prompt: agent.prompt,
      model: agent.model,
      active: Boolean(agent.active), // Conversão explícita para boolean
      type: agent.type
    };
    
    try {
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
        
        // Atualizar lista de agentes localmente
        setAgents(prev => 
          prev.map(a => a.id === agent.id ? agent : a)
        );
        
        return true;
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
      return false;
    }
  };

  // Buscar agentes ao carregar
  useEffect(() => {
    fetchAgents();
  }, []);

  return {
    agents,
    isLoading,
    activeAgentId,
    setActiveAgentId,
    saveAgent,
    refreshAgents: fetchAgents
  };
};
