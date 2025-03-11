import { useState, useEffect } from "react";
import { Agent } from "@/types/agent";
import { toast } from "@/components/ui/use-toast";
import { MessageCircle, ShoppingBag, CheckCircle, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    setLoading(true);
    try {
      // Primeiro tenta buscar do Supabase
      const { data: dbAgents, error: dbError } = await supabase
        .from('agents')
        .select('*');

      if (dbError) throw dbError;

      if (dbAgents && dbAgents.length > 0) {
        // Mapeia os agentes do banco para incluir os ícones
        const mappedAgents = dbAgents.map(agent => ({
          ...agent,
          icon: getAgentIcon(agent.type)
        }));
        setAgents(mappedAgents);
      } else {
        // Se não houver agentes no banco, usa os dados mockados
        const mockAgents: Agent[] = [
          {
            id: "atendimento",
            name: "Agente de Atendimento",
            description: "Coleta dados de clientes e gera orçamentos preliminares",
            prompt: `Você é um ASSISTENTE DE Vendas especialista com 20 anos de experiência em conduzir negociações e fechar negócios para a empresa IPT Teixeira, líder na produção de artefatos de concreto há mais de 30 anos. Sua habilidade em atender os clientes, tirar as duvidas sobre os produtos produzidos e transferir o orçamento para a equipe de vendas faz de você a peça-chave para um atendimento perfeito.`,
            model: "gemini-pro",
            active: true,
            type: "atendimento",
            icon: MessageCircle
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
            id: "validacao",
            name: "Agente de Validação",
            description: "Auxilia o gerente na validação e preenchimento de orçamentos",
            prompt: "Você é um assistente de validação para o gerente de vendas da IPT Teixeira. Sua função é auxiliar na revisão dos orçamentos, verificando se todas as informações estão completas e corretas.",
            model: "gpt-4o-mini",
            active: true,
            type: "validacao",
            icon: CheckCircle
          },
          {
            id: "email",
            name: "Agente de E-mail",
            description: "Gera e envia e-mails com orçamentos para os clientes",
            prompt: "Você é responsável por criar e-mails profissionais com orçamentos anexados. Seu tom deve ser cordial, claro e profissional. Sempre inclua um resumo do orçamento no corpo do e-mail.",
            model: "claude-3-haiku",
            active: false,
            type: "email",
            icon: Mail
          }
        ];
        
        setAgents(mockAgents);
        
        // Opcionalmente, podemos inserir os agentes mockados no banco
        for (const agent of mockAgents) {
          const { error: insertError } = await supabase
            .from('agents')
            .insert([{
              agent_id: agent.id,
              name: agent.name,
              description: agent.description,
              prompt: agent.prompt,
              model: agent.model,
              active: agent.active,
              type: agent.type
            }]);
            
          if (insertError) console.error('Erro ao inserir agente:', insertError);
        }
      }
      
      setError(null);
    } catch (err) {
      console.error("Erro ao carregar agentes:", err);
      setError("Não foi possível carregar os agentes. Por favor, tente novamente.");
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao carregar os agentes.",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateAgent = async (updatedAgent: Agent) => {
    try {
      // Atualiza no Supabase
      const { error: dbError } = await supabase
        .from('agents')
        .update({
          name: updatedAgent.name,
          description: updatedAgent.description,
          prompt: updatedAgent.prompt,
          model: updatedAgent.model,
          active: updatedAgent.active,
          type: updatedAgent.type
        })
        .eq('agent_id', updatedAgent.id);

      if (dbError) throw dbError;

      // Atualiza o estado local
      setAgents(prev => 
        prev.map(agent => 
          agent.id === updatedAgent.id ? updatedAgent : agent
        )
      );
      
      toast({
        title: "Agente atualizado",
        description: `O agente ${updatedAgent.name} foi atualizado com sucesso.`,
      });
      
      return true;
    } catch (error) {
      console.error("Erro ao atualizar agente:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível atualizar o agente. Por favor, tente novamente.",
      });
      return false;
    }
  };

  const getAgentByType = (type: Agent["type"]) => {
    return agents.find(agent => agent.type === type && agent.active);
  };

  // Função auxiliar para mapear o tipo do agente para o ícone correspondente
  const getAgentIcon = (type: string) => {
    switch (type) {
      case 'atendimento':
        return MessageCircle;
      case 'orcamento':
        return ShoppingBag;
      case 'validacao':
        return CheckCircle;
      case 'email':
        return Mail;
      default:
        return MessageCircle;
    }
  };

  return {
    agents,
    loading,
    error,
    loadAgents,
    updateAgent,
    getAgentByType,
  };
}
