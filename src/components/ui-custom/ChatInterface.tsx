import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Card } from "./Card";
import type { ChatInterfaceProps, Message } from "@/types/chat";

export const ChatInterface = ({ 
  welcomeMessage = "Olá, como posso ajudar?",
  placeholder = "Digite sua mensagem..."
}: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: welcomeMessage,
      sender: "agent",
      timestamp: new Date(Date.now() - 60000),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const simulateAgentResponse = (userMessage: string) => {
    setIsTyping(true);
    
    setTimeout(() => {
      let response: string;
      
      if (userMessage.toLowerCase().includes("produto")) {
        response = "Quais tipos de produtos você está procurando? Posso ajudar a encontrar a melhor opção para sua necessidade.";
      } else if (userMessage.toLowerCase().includes("preço") || userMessage.toLowerCase().includes("valor")) {
        response = "Para fornecer um orçamento preciso, preciso saber qual produto, quantidade e local de entrega. Pode me informar esses detalhes?";
      } else if (userMessage.toLowerCase().includes("entrega")) {
        response = "Trabalhamos com entregas em todo o Brasil. Pode me informar o CEP ou cidade para que eu possa verificar o prazo de entrega?";
      } else {
        response = "Agradeço pelo seu contato. Para te atender melhor, preciso saber qual produto você está interessado, a quantidade desejada e o local de entrega. Pode me fornecer essas informações?";
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

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <Card className="flex flex-col h-[600px] p-0 overflow-hidden" glassmorphism>
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
        <Button variant="ghost" size="icon">
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
