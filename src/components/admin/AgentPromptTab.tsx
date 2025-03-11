
import { useState, useEffect } from "react";
import { Agent } from "@/types/agent";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Copy, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AgentPromptTabProps {
  agent: Agent;
  onUpdate: (updatedAgent: Agent) => void;
}

export const AgentPromptTab = ({ agent, onUpdate }: AgentPromptTabProps) => {
  const [prompt, setPrompt] = useState(agent.prompt);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  // Atualizar o prompt quando o agente selecionado muda
  useEffect(() => {
    setPrompt(agent.prompt);
  }, [agent.id, agent.prompt]);

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };

  const handleSavePrompt = () => {
    if (prompt.trim() === "") {
      toast({
        title: "Campo obrigatório",
        description: "O prompt não pode estar vazio.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      onUpdate({
        ...agent,
        prompt: prompt
      });
      
      toast({
        title: "Prompt atualizado",
        description: "As alterações foram salvas localmente. Clique em 'Salvar Configurações' para persistir.",
        variant: "default",
      });
    } catch (error) {
      console.error("Erro ao atualizar prompt:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o prompt.",
        variant: "destructive",
      });
    }
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(prompt);
    setIsCopied(true);
    
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="agent-prompt" className="text-base font-medium">
          Prompt do Agente
        </Label>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleCopyPrompt}
        >
          {isCopied ? (
            <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
          ) : (
            <Copy className="h-4 w-4 mr-1" />
          )}
          {isCopied ? "Copiado!" : "Copiar"}
        </Button>
      </div>
      
      <Textarea
        id="agent-prompt"
        value={prompt}
        onChange={handlePromptChange}
        className="min-h-[400px] font-mono text-sm"
        placeholder="Insira aqui o prompt para definir o comportamento do agente..."
      />
      
      <div className="flex justify-end">
        <Button onClick={handleSavePrompt}>
          Aplicar Alterações
        </Button>
      </div>
      
      <p className="text-xs text-muted-foreground">
        Use este prompt para definir o comportamento, tom e instruções específicas para o agente.
        Clique em "Aplicar Alterações" para salvar temporariamente. Para persistir, use o botão "Salvar Configurações" no topo.
      </p>
    </div>
  );
};
