
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";
import { Agent, AgentDB } from "@/types/agent";
import { Bot, MessageSquare, ShoppingBag, LucideIcon } from "lucide-react";

export const useAgents = () => {
  const { toast } = useToast();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null);

  const getAgentIcon = (type: string): LucideIcon => {
    switch(type) {
      case 'atendimento': return MessageSquare;
      case 'orcamento': return ShoppingBag;
      case 'email': return Bot;
      default: return MessageSquare;
    }
  };

  // Agentes padrão para usar como fallback
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

  const fetchAgents = async () => {
    try {
      setIsLoading(true);
      console.log("Iniciando busca de agentes...");
      
      // Tentar buscar agentes através da função Edge
      try {
        const response = await supabase.functions.invoke('manage-agents', {
          body: { method: 'GET_ALL' }
        });
        
        console.log("Resposta da função manage-agents:", response);
        
        if (response && response.data && response.data.success && Array.isArray(response.data.data) && response.data.data.length > 0) {
          // Converter os agentes do banco para o formato da interface
          const fetchedAgents = response.data.data.map((agent: AgentDB) => ({
            id: agent.agent_id,
            name: agent.name,
            description: agent.description || "",
            prompt: agent.prompt,
            model: agent.model as any,
            active: Boolean(agent.active),
            type: agent.type as any,
            icon: getAgentIcon(agent.type)
          }));
          
          console.log("Agentes carregados com sucesso:", fetchedAgents.length);
          setAgents(fetchedAgents);
          
          // Definir o primeiro agente como ativo se nenhum estiver selecionado
          if (fetchedAgents.length > 0 && !activeAgentId) {
            setActiveAgentId(fetchedAgents[0].id);
          }
          
          return;
        } else {
          console.log("Nenhum agente encontrado ou resposta inválida, usando agentes padrão");
        }
      } catch (error) {
        console.error("Erro ao buscar agentes da função Edge:", error);
      }
      
      // Se chegou aqui, significa que houve algum problema com a busca dos agentes
      // Vamos usar os agentes padrão
      console.log("Usando agentes padrão");
      setAgents(defaultAgents);
      
      // Definir o primeiro agente como ativo se nenhum estiver selecionado
      if (!activeAgentId) {
        setActiveAgentId(defaultAgents[0].id);
      }
      
    } catch (error) {
      console.error("Erro ao buscar agentes:", error);
      toast({
        title: "Erro ao carregar agentes",
        description: "Não foi possível recuperar os agentes do banco de dados. Usando valores padrão.",
        variant: "destructive",
      });
      
      // Em caso de falha total, definir agentes padrão
      setAgents(defaultAgents);
      if (!activeAgentId && defaultAgents.length > 0) {
        setActiveAgentId(defaultAgents[0].id);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const saveAgent = async (agent: Agent) => {
    try {
      if (!agent) {
        throw new Error("Agente inválido");
      }
      
      if (!agent.prompt || agent.prompt.trim() === "") {
        throw new Error("O prompt do agente não pode estar vazio");
      }
      
      console.log("Salvando agente:", agent);
      
      // Preparar os dados para o formato do banco
      const agentData = {
        agent_id: agent.id,
        name: agent.name,
        description: agent.description,
        prompt: agent.prompt,
        model: agent.model,
        active: Boolean(agent.active),
        type: agent.type
      };
      
      // Chamar a função Edge para salvar o agente
      const response = await supabase.functions.invoke('manage-agents', {
        body: { 
          method: 'UPDATE',
          agentData
        }
      });
      
      console.log("Resposta da atualização:", response);
      
      if (response && response.data && response.data.success) {
        toast({
          title: "Configurações salvas",
          description: "As configurações do agente foram atualizadas com sucesso.",
          variant: "default",
        });
        
        // Atualizar lista de agentes localmente
        setAgents(prev => 
          prev.map(a => a.id === agent.id ? {...agent, icon: getAgentIcon(agent.type)} : a)
        );
        
        return true;
      } else {
        const errorMsg = (response?.data?.error) ? response.data.error : "Erro ao comunicar com o servidor";
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error("Erro ao salvar agente:", error);
      toast({
        title: "Erro ao salvar",
        description: `Não foi possível salvar as configurações: ${error.message || "Erro desconhecido"}`,
        variant: "destructive",
      });
      return false;
    }
  };

  // Buscar agentes ao carregar o componente
  useEffect(() => {
    fetchAgents();
  }, []);

  return {
    agents,
    setAgents, // Exportando a função setAgents para permitir atualizações diretas
    isLoading,
    activeAgentId,
    setActiveAgentId,
    saveAgent,
    refreshAgents: fetchAgents
  };
};
