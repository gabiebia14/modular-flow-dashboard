
import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Card } from "./Card";
import type { ChatInterfaceProps, Message } from "@/types/chat";
import { Agent, Quote, QuoteProduct } from "@/types/agent";
import { useAgents } from "@/hooks/use-agents";
import { useQuotes } from "@/hooks/use-quotes";
import { useIsMobile } from "@/hooks/use-mobile";

export const ChatInterface = ({ 
  welcomeMessage = "Olá, como posso ajudar?",
  placeholder = "Digite sua mensagem...",
  agentType = "atendimento",
  onQuoteCreated
}: ChatInterfaceProps & {
  agentType?: Agent["type"];
  onQuoteCreated?: (quote: Quote) => void;
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isCollectingData, setIsCollectingData] = useState(false);
  const [quoteData, setQuoteData] = useState<{
    clientName: string;
    clientEmail: string;
    products: QuoteProduct[];
    location: string;
    paymentMethod?: string;
  } | null>(null);
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { getAgentByType } = useAgents();
  const { createQuote } = useQuotes();
  const isMobile = useIsMobile();
  
  const agent = getAgentByType(agentType);

  useEffect(() => {
    // Inicializar mensagem de boas-vindas
    if (agent && messages.length === 0) {
      setMessages([
        {
          id: "1",
          content: welcomeMessage,
          sender: "agent",
          timestamp: new Date(Date.now() - 60000),
        },
      ]);
    }
  }, [agent, welcomeMessage, messages.length]);

  const simulateAgentResponse = (userMessage: string) => {
    setIsTyping(true);
    
    setTimeout(() => {
      let response: string;
      
      // Verifica se há menção a produtos específicos
      if (userMessage.toLowerCase().includes("poste")) {
        response = "Qual tipo de poste você precisa? Temos postes circulares e duplo T.";
        setIsCollectingData(true);
      } else if (userMessage.toLowerCase().includes("bloco")) {
        response = "Qual tipo de bloco você procura? Temos bloco estrutural e bloco de vedação.";
        setIsCollectingData(true);
      } else if (userMessage.toLowerCase().includes("tubo")) {
        response = "Qual a dimensão do tubo você procura? Temos opções como 0,30 x 1,00, 0,40 x 1,50, 0,50 x 1,50, entre outras.";
        setIsCollectingData(true);
      } else if (isCollectingData && (userMessage.toLowerCase().includes("circular") || userMessage.toLowerCase().includes("duplo t"))) {
        if (userMessage.toLowerCase().includes("circular")) {
          response = "Ótimo! E qual poste circular? Temos opções como 08/0800, 09/0600, 10/0400, etc. Qual padrão de poste (CPFL, Elektro ou Telefônica)?";
        } else {
          response = "Ótimo! E qual poste duplo T? Temos opções como 07,5/0200DAN, 09/0300DAN, 10/0600DAN, etc.";
        }
      } else if (isCollectingData && userMessage.toLowerCase().includes("quantidade")) {
        response = "Entendi! E qual a localização para entrega desses itens?";
      } else if (isCollectingData && (userMessage.toLowerCase().includes("são paulo") || userMessage.toLowerCase().includes("sp") || userMessage.toLowerCase().includes("ribeirão"))) {
        response = "Perfeito! E qual seria a forma de pagamento pretendida?";
      } else if (isCollectingData && (userMessage.toLowerCase().includes("boleto") || userMessage.toLowerCase().includes("pix") || userMessage.toLowerCase().includes("cartão"))) {
        // Finalizar a coleta de dados
        response = "Obrigado por todas as informações! Vou encaminhar seu pedido para o setor de vendas preparar um orçamento detalhado. Em breve um de nossos consultores entrará em contato. Seria possível me passar seu e-mail para enviarmos o orçamento?";
      } else if (isCollectingData && userMessage.includes("@")) {
        // Extrai email do usuário
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
        const match = userMessage.match(emailRegex);
        const email = match ? match[0] : "";
        
        if (email) {
          // Criar dados do orçamento simulado
          setQuoteData({
            clientName: "Cliente Web",
            clientEmail: email,
            products: [
              {
                id: "prod-temp-1",
                name: "Poste Circular",
                type: "Poste",
                subtype: "Circular",
                dimension: "09/0600",
                quantity: 5,
              }
            ],
            location: "São Paulo, SP",
            paymentMethod: "Boleto",
          });
          
          response = "Obrigado! Seu orçamento (Poste Circular 09/0600, quantidade: 5) foi encaminhado com sucesso. Um consultor entrará em contato em breve pelo e-mail informado.";
          setIsCollectingData(false);
          
          // Criar orçamento no sistema
          if (onQuoteCreated) {
            setTimeout(() => {
              createQuote({
                clientName: "Cliente Web",
                clientEmail: email,
                products: [
                  {
                    id: "prod-temp-1",
                    name: "Poste Circular",
                    type: "Poste",
                    subtype: "Circular",
                    dimension: "09/0600",
                    quantity: 5,
                  }
                ],
                location: "São Paulo, SP",
                paymentMethod: "Boleto",
              }).then(quote => {
                if (quote && onQuoteCreated) {
                  onQuoteCreated(quote);
                }
              });
            }, 1000);
          }
        } else {
          response = "Não consegui identificar seu e-mail. Poderia digitar novamente, por favor?";
        }
      } else if (userMessage.toLowerCase().includes("preço") || userMessage.toLowerCase().includes("valor")) {
        response = "Para fornecer um orçamento preciso, preciso saber qual produto, quantidade e local de entrega. Pode me informar esses detalhes?";
      } else if (userMessage.toLowerCase().includes("entrega")) {
        response = "Trabalhamos com entregas em todo o Brasil. Pode me informar o CEP ou cidade para que eu possa verificar o prazo de entrega?";
      } else if (userMessage.toLowerCase().includes("catálogo") || userMessage.toLowerCase().includes("catalogo") || userMessage.toLowerCase().includes("produtos")) {
        response = "Você pode consultar nosso catálogo completo em: https://www.iptteixeira.com.br/catalogo/2015/files/assets/basic-html/index.html#1";
      } else if (userMessage.toLowerCase().includes("empresa") || userMessage.toLowerCase().includes("história") || userMessage.toLowerCase().includes("sobre")) {
        response = "A IPT Teixeira é líder na produção de artefatos de concreto há mais de 30 anos. Você pode conhecer mais sobre nossa empresa neste vídeo institucional: https://www.youtube.com/watch?v=MOsHYJ1yq5E";
      } else {
        response = "Como posso ajudar você hoje? Gostaria de informações sobre algum de nossos produtos como postes, tubos, blocos ou outros artefatos de concreto?";
      }
      
      const newMessage: Message = {
        id: Date.now().toString(),
        content: response,
        sender: "agent",
        timestamp: new Date(),
      };
      
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSendMessage = () => {
    if (inputValue.trim() === "") return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    };
    
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInputValue("");
    
    simulateAgentResponse(inputValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: "reset-" + Date.now(),
        content: welcomeMessage,
        sender: "agent",
        timestamp: new Date(),
      },
    ]);
    setIsCollectingData(false);
    setQuoteData(null);
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <Card className={`flex flex-col ${isMobile ? "h-[500px]" : "h-[600px]"} p-0 overflow-hidden`} glassmorphism>
      <div className="px-4 py-3 border-b flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8 bg-primary">
            <span className="text-xs font-medium">AT</span>
          </Avatar>
          <div>
            <h3 className="text-sm font-medium">Agente de Atendimento</h3>
            <p className="text-xs text-green-500">Online</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={handleReset}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      
      <ScrollArea
        ref={scrollAreaRef}
        className="flex-1 px-4 py-4"
      >
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.sender === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] px-4 py-2 rounded-lg animate-slide-in",
                  message.sender === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                )}
              >
                <p className="text-sm">{message.content}</p>
                <span className="text-xs opacity-70 mt-1 block text-right">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex items-center space-x-2 text-muted-foreground animate-pulse">
              <div className="w-2 h-2 rounded-full bg-current"></div>
              <div className="w-2 h-2 rounded-full bg-current"></div>
              <div className="w-2 h-2 rounded-full bg-current"></div>
            </div>
          )}
        </div>
      </ScrollArea>
      
      <div className="border-t p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-end space-x-2"
        >
          <Button type="button" size="icon" variant="ghost">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="min-h-[80px] resize-none"
          />
          <Button
            type="submit"
            size="icon"
            disabled={inputValue.trim() === ""}
            className={cn(
              "transition-all ml-2",
              inputValue.trim() === "" ? "opacity-50" : "opacity-100"
            )}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </Card>
  );
};
