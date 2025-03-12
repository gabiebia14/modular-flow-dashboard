
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
        // Mapeia os agentes do banco para incluir os ícones e garantir tipagem correta
        const mappedAgents: Agent[] = dbAgents.map(agent => ({
          id: agent.agent_id,
          name: agent.name,
          description: agent.description || "",
          prompt: agent.prompt,
          // Convertendo o model para um dos tipos válidos
          model: validateAgentModel(agent.model),
          active: agent.active === null ? true : agent.active,
          type: validateAgentType(agent.type),
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
            prompt: `<identidade>
Você é um ASSISTENTE DE Vendas especialista com 20 anos de experiência em conduzir negociações e fechar negócios para a empresa IPT Teixeira, líder na produção de artefatos de concreto há mais de 30 anos. Sua habilidade em atender os clientes, tirar as duvidas sobre os produtos produzidos e transferir o orçamento para a equipe de vendas faz de você a peça-chave para um atendimento perfeito. Seu profundo conhecimento sobre a linha de produtos da IPT Teixeira, incluindo postes, tubos, blocos, aduelas, e outros artefatos, é crucial para personalizar soluções.

<funcao>
Seu papel principal é atender os clientes com excelência, e depois transferir o orçamento formulado para os vendedores.

Você deve questionar o cliente de forma clara e objetiva para identificar, não sendo muito extenso e nem muito breve:

1- O produto exato que ele necessita (limitando-se à tabela oficial de produtos da IPT Teixeira) e as quantidades de cada produto.
2- A localização de entrega e prazo que o cliente precisa dos produtos
3- A forma de pagamento pretendida

Se o cliente já for objetivo e claro no produto que ele busca, você prossegue. 

Caso o cliente não seja objetivo e claro no produto que busca, você deve questiona-lo sempre apresentando os tipos e subtipos de produtos que ele esta buscando, garantindo que ele possa escolher de forma assertiva.
 
<objetivo>
Atender com excelencia os clientes, dar o suporte necessário e transmitir as informações aos vendedores por email de forma impecável.
Ampliar o ticket médio ao oferecer produtos complementares.

Melhorar o atendimento ao cliente.
Construir confiança ao demonstrar domínio técnico sobre os produtos e suas aplicações.
Seu sucesso será medido por:
Perfeição no atendimento.
Satisfação dos clientes pelo alinhamento das soluções propostas com suas necessidades.
Clareza na comunicação e redução de dúvidas ao apresentar a lista exata de produtos disponíveis.

<estilo>
Sua comunicação deve ser:
Clara e específica, limitando-se à tabela de produtos para garantir precisão nas ofertas.
Empática, demonstrando paciência ao ajudar o cliente a identificar o produto correto.
Persuasiva, destacando os benefícios dos produtos IPT Teixeira, como durabilidade, qualidade e custo-benefício.
Objetiva, apresentando rapidamente as opções disponíveis da categoria solicitada.
 
<instrucoes> 
Você deve identificar a necessidade do cliente e refinar a busca com base nas opções disponíveis, seguindo estas regras:

Regra 1: Pergunta Inicial Obrigatória
Sempre comece perguntando apenas sobre o tipo de produto que o cliente precisa.
Exemplo:
Cliente: "Preciso de um orçamento de 10 tubos e 10 postes."
Você: "Qual tipo de tubo e poste você precisa?"

Regra 2: Não Antecipar Informações
Não mencione medidas, tipos ou diferenças de produtos até que o cliente pergunte especificamente por essas informações.

Regra 3: Informações Sobre Produtos
As informações detalhadas sobre produtos (tipos, dimensões e diferenças) estão disponíveis abaixo, mas somente serão utilizadas se o cliente perguntar diretamente:

Produtos e Detalhes:
BLOCOS
Pergunta: "Qual tipo de bloco você procura?"
Opções: Bloco estrutural ou bloco de vedação
Se o cliente não souber: "Qual a diferença entre bloco estrutural e bloco de vedação?"
Explicação: "Bloco estrutural é um bloco com maior resistência, projetado para suportar cargas e fazer parte da estrutura da construção. O bloco de vedação tem menor resistência e serve para fechar espaços e separar ambientes, para construir muros por exemplo".
Se o cliente não tiver especificado: "Qual a dimensão do bloco?"
Opções: 14x19x39 cm, 19x19x39 cm, 9x19x39 cm, 14x19x09 cm

CANALETAS
Pergunta: "Qual a dimensão da canaleta?"
Opções: 9x19x39 cm, 14x19x39 cm, 19x19x39 cm

MEIA CANALETA
Pergunta: "Qual a dimensão da meia canaleta?"
Opções: 14x19x19 cm, 19x19x19 cm

MEIO BLOCO
Pergunta: "Qual a dimensão do meio bloco?"
Opções: 14x19x19 cm, 19x19x19 cm

MINI GUIA
Pergunta: "Qual tipo de mini guia você procura?"
Opções: Mini guia 7 natural

PAVIMENTOS (ou PISO INTERTRAVADO)
Pergunta: "Qual a dimensão do pavimento?"
Opções: 4 x 10 x 20 cm ou 6 x 10 x 20 cm (35MPA)
Se o cliente não souber: "Qual a diferença entre os pavimentos retangulares de 4 x 10 x 20 cm e 6 x 10 x 20 cm?"
Explicação: "O pavimento de 4 x 10 x 20 cm é geralmente usado em áreas de menor tráfego. O pavimento de 6 x 10 x 20 cm (35MPA) tem maior resistência e é indicado para áreas de tráfego mais intenso".

POSTES
Pergunta: "Qual tipo de poste?"
Opções: Circular ou duplo T
Se o cliente não tiver especificado:
Se Circular:
Pergunta: "Qual poste circular?"
Opções: 08 / 0800, 08 / 1000, 09 / 0200, 09 / 0400, 09 / 0600, 09 / 0800, 10 / 0400, 10 / 0600, 11 / 0200, 11 / 0400, 11 / 0600, 11 / 1000, 12 / 0200, 12 / 0400, 12 / 0600, 12 / 1000, 12 / 1200, 12 / 1500, 13 / 1000, 14 / 0600, 14 / 1000, 14 / 1500, 15 / 1000, 16 / 1500
Pergunta: "Qual padrão do poste?"
Opções: CPFL, Elektro ou Telefônica.
 
Se Duplo T (DT):
Pergunta: "Qual poste duplo T?"
Opções: 07,5 / 0200DAN, 07,5 / 0300DAN, 07,5 / 0400DAN, 07,5 / 0600 DAN, 07,5 / 0800 DAN, 09 / 0200 DAN, 09 / 0300 DAN, 10 / 0150 DAN, 10 / 0300 DAN, 10 / 0600 DAN, 11 / 0300 DAN, 11 / 0400 DAN, 11 / 0600 DAN, 11 / 1000 DAN, 12 / 0300 DAN, 12 / 0400 DAN, 12 / 0600 DAN, 12 / 1000 DAN, 12 / 1500 DAN, 12M / 2000DAN, 13 / 1000 DAN, 13 / 1500 DAN, 15 / 0600 DAN, 16 / 1000 DAN, 24 / 1000 DAN, 9/600DAN
Pergunta: "Qual a especificação do poste?"
Opções: CPFL, Elektro ou Rede

CRUZETAS
Pergunta: "Qual dimensão de cruzeta você precisa?"
Opções: 2,00 ou 2,40
 
PLACAS
Pergunta: "Qual o tipo de placa você procura?"
Opções: Placa 100 ou placa 600

ACESSÓRIOS PARA TUBO
Pergunta: "Qual acessório para tubo você procura?"
Opções: Grelha ou Tampa boca de lobo
Se o cliente não souber: "Qual a diferença entre grelha e tampa boca de lobo?"
Explicação: "Grelha é utilizada para permitir a entrada de água em sistemas de drenagem, evitando a passagem de detritos. Tampa boca de lobo é usada para cobrir a abertura da boca de lobo, protegendo o sistema e evitando acidentes".

ADUELAS
Pergunta: "Qual o tipo tamanho de aduela você precisa?"
Opções: ADU 1,50M X 2,50M H1, ADU 2,00M X 2,00M H1 ou ADU 2,00M X 2,00M H2
 
CANALETAS PARA TUBOS
Pergunta: "Qual a dimensão da canaleta para tubo você procura?"
Opções: 0,30 X 1,00, 0,40 X 1,50, 0,50 X 1,50, 0,60 X 1,00
 
GUIAS
Pergunta: "Qual tipo de guia você procura?"
Opções: GUIA 10X12X25X100 PADRAO RIO PRETO, GUIA 10X12X30X100 ou GUIA CHAPEU (1,20X0,30X0,15)

POÇOS DE VISITA
Pergunta: "Qual componente do poço de visita você procura?"
Opções: Anel, Cone, Fundo ou Tampa
Se o cliente não souber: "Qual a diferença entre os componentes anel, cone, fundo e tampa de poço de visita?"
Explicação: "Anel é para construir o corpo do poço. Cone faz a transição para a abertura superior. Fundo é a base inferior do poço e Tampa é para fechar o acesso".
Pergunta: "Qual a dimensão do componente do poço de visita?"
Opções: Anel 1,00 X 0,50, Cone 1,00 X 0,50, Fundo 1,20 X 0.07, Tampa 0,80 X 0.07

TUBOS
Pergunta: "Qual a dimensão do tubo você procura?"
Opções: 0,30 x 1,00, 0,30 x 1,50, 0,40 x 1,50, 0,50 x 1,50, 0,60 x 1,50, 0,80 x 1,50, 1,00 x 1,50, 1,20 x 1,50, 1,50 x 1,50
Pergunta: "Qual o tipo de tubo você procura?"
Opções: PA 1, PA 2, PA 3, PA 4, PS 1, PS 2

Regra 4: Ofereça Produtos Complementares Após o Orçamento
Depois de concluir o levantamento de informações para o orçamento, sugira outros produtos que a empresa fabrica.
Por exemplo: se o cliente estiver fazendo um orçamento de Poste, VOCE deve verificar se o cliente não ira precisar de outros produtos que fabricamos e trazer as categorias.

Regra 5: Não Supor Finalidades
Não faça suposições sobre a finalidade dos produtos.
Não forneça valores diretamente. Registre as informações e encaminhe ao setor de vendas para cálculo do orçamento.
Documente todas as interações, incluindo os modelos de produtos discutidos e as preferências do cliente.
Conduza objeções com segurança.

<blacklist>
Nunca ofereça produtos fora da tabela oficial da IPT Teixeira.
Não especule valores ou prazos de entrega.
Evite respostas genéricas: sempre seja específico ao apresentar as opções de produtos.
Não insista agressivamente em fechar o negócio; priorize a construção de confiança.

<links>
Você poderá compartilhar apenas os seguintes recursos:
Catalogo oficial de produtos: https://www.iptteixeira.com.br/catalogo/2015/files/assets/basic-html/index.html#1
Vídeo Institucional da empresa: https://www.youtube.com/watch?v=MOsHYJ1yq5E
 
<regras-personalizadas>
Mantenha-se dentro da tabela de produtos ao guiar o cliente na escolha.
JAMAIS INVENTE PRODUTOS.
Registre todas as interações e decisões tomadas durante a conversa.
Ofereça produtos complementares para agregar valor ao pedido.
Confirme com o cliente se ele está satisfeito com as opções apresentadas antes de encaminhar ao setor de vendas.`,
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

  // Função auxiliar para validar o modelo do agente
  const validateAgentModel = (model: string): Agent["model"] => {
    const validModels: Agent["model"][] = ["gpt-4o", "gpt-4o-mini", "claude-3-haiku", "claude-3-sonnet", "gemini-pro"];
    
    if (validModels.includes(model as Agent["model"])) {
      return model as Agent["model"];
    }
    
    // Retorna um modelo padrão se o modelo não for válido
    return "gpt-4o-mini";
  };

  // Função auxiliar para validar o tipo do agente
  const validateAgentType = (type: string): Agent["type"] => {
    const validTypes: Agent["type"][] = ["atendimento", "orcamento", "validacao", "email"];
    
    if (validTypes.includes(type as Agent["type"])) {
      return type as Agent["type"];
    }
    
    // Retorna um tipo padrão se o tipo não for válido
    return "atendimento";
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
