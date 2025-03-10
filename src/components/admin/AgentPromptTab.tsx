
import { useState, useEffect } from "react";
import { Agent } from "@/types/agent";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";

interface AgentPromptTabProps {
  agent: Agent;
  onUpdate: (updatedAgent: Agent) => void;
}

export const AgentPromptTab = ({ agent, onUpdate }: AgentPromptTabProps) => {
  const [prompt, setPrompt] = useState(agent.prompt);

  // Atualizar o prompt quando o agente selecionado muda
  useEffect(() => {
    setPrompt(agent.prompt);
  }, [agent.id, agent.prompt]);

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };

  const handleSavePrompt = () => {
    onUpdate({
      ...agent,
      prompt: prompt
    });
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(prompt);
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
          <Copy className="h-4 w-4 mr-1" />
          Copiar
        </Button>
      </div>
      
      <Textarea
        id="agent-prompt"
        value={prompt}
        onChange={handlePromptChange}
        onBlur={handleSavePrompt}
        className="min-h-[400px] font-mono text-sm"
        placeholder="Insira aqui o prompt para definir o comportamento do agente..."
      />
      
      <p className="text-xs text-muted-foreground">
        Use este prompt para definir o comportamento, tom e instruções específicas para o agente.
        As alterações são salvas automaticamente ao clicar fora da área de texto.
      </p>
    </div>
  );
};
