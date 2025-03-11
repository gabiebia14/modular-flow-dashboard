
import { useState, useEffect } from "react";
import { Agent } from "@/types/agent";
import { toast } from "@/components/ui/use-toast";
import { MessageCircle, ShoppingBag, CheckCircle, Mail } from "lucide-react";

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
      // Simular carregamento de agentes do backend
      // Em uma implementação real, isso viria do Supabase
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
      // Simular atualização no backend
      // Em uma implementação real, isso iria para o Supabase
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

  return {
    agents,
    loading,
    error,
    loadAgents,
    updateAgent,
    getAgentByType,
  };
}
