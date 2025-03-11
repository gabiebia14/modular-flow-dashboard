
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui-custom/Card";
import { Label } from "@/components/ui/label";
import { Agent } from "@/types/agent";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AgentModelTabProps {
  agent: Agent;
  onUpdate: (updatedAgent: Agent) => void;
}

export const AgentModelTab = ({ agent, onUpdate }: AgentModelTabProps) => {
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>(agent.model);
  const [temperature, setTemperature] = useState<number>(0.7);
  const [maxLength, setMaxLength] = useState<number>(2048);
  const { toast } = useToast();

  // Mapear o modelo atual para o provedor correspondente
  useEffect(() => {
    if (agent.model.startsWith("gpt-")) {
      setSelectedProvider("openai");
    } else if (agent.model.startsWith("gemini-")) {
      setSelectedProvider("google");
    } else if (agent.model.startsWith("claude-")) {
      setSelectedProvider("anthropic");
    } else if (agent.model.startsWith("deepseek-")) {
      setSelectedProvider("deepseek");
    }
    
    setSelectedModel(agent.model);
  }, [agent.model]);

  const handleProviderChange = (value: string) => {
    const provider = value;
    setSelectedProvider(provider);
    
    // Definir o modelo padrão para o provedor selecionado
    let defaultModel;
    switch(provider) {
      case "openai":
        defaultModel = "gpt-4o-mini";
        break;
      case "google":
        defaultModel = "gemini-pro";
        break;
      case "anthropic":
        defaultModel = "claude-3-haiku";
        break;
      case "deepseek":
        defaultModel = "deepseek-chat";
        break;
      default:
        defaultModel = "gpt-4o-mini";
    }
    
    setSelectedModel(defaultModel);
    applyModelChanges(defaultModel);
  };

  const handleModelChange = (value: string) => {
    const model = value;
    setSelectedModel(model);
    applyModelChanges(model);
  };
  
  const applyModelChanges = (model: string) => {
    try {
      // Verificar se o modelo é válido para o tipo de Agent
      const validModels = ["gpt-4o", "gpt-4o-mini", "claude-3-haiku", "claude-3-sonnet"];
      if (!validModels.includes(model)) {
        toast({
          title: "Modelo não suportado",
          description: `O modelo ${model} não é suportado atualmente.`,
          variant: "destructive",
        });
        return;
      }
      
      // Atualizar o agente com o novo modelo
      onUpdate({
        ...agent,
        model: model as any
      });
      
      toast({
        title: "Modelo atualizado",
        description: "As alterações foram salvas localmente. Clique em 'Salvar Configurações' para persistir.",
        variant: "default",
      });
    } catch (error) {
      console.error("Erro ao atualizar modelo:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o modelo.",
        variant: "destructive",
      });
    }
  };

  const handleTemperatureChange = (value: number[]) => {
    setTemperature(value[0]);
    // Aqui você poderia atualizar o agente com a nova temperatura
    // quando implementarmos este campo na tabela agents
  };

  const handleMaxLengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setMaxLength(isNaN(value) ? 1024 : value);
    // Aqui você poderia atualizar o agente com o novo maxLength
    // quando implementarmos este campo na tabela agents
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Modelo de Linguagem</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Provedor</Label>
              <Select 
                value={selectedProvider}
                onValueChange={handleProviderChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um provedor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                  <SelectItem value="google">Google (Gemini)</SelectItem>
                  <SelectItem value="deepseek">Deepseek</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Modelo</Label>
              <Select 
                value={selectedModel}
                onValueChange={handleModelChange}
                disabled={!selectedProvider}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um modelo" />
                </SelectTrigger>
                <SelectContent>
                  {selectedProvider === "openai" && (
                    <>
                      <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                      <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                    </>
                  )}
                  {selectedProvider === "anthropic" && (
                    <>
                      <SelectItem value="claude-3-haiku">Claude 3 Haiku</SelectItem>
                      <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                    </>
                  )}
                  {selectedProvider === "google" && (
                    <>
                      <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                    </>
                  )}
                  {selectedProvider === "deepseek" && (
                    <>
                      <SelectItem value="deepseek-chat">Deepseek Chat</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
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
              <Label className="text-sm font-medium">Temperatura: {temperature.toFixed(1)}</Label>
              <Slider
                value={[temperature]}
                min={0}
                max={1}
                step={0.1}
                onValueChange={handleTemperatureChange}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Determinístico</span>
                <span>Criativo</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Tamanho Máximo</Label>
              <Input 
                type="number" 
                value={maxLength}
                onChange={handleMaxLengthChange}
                className="w-full"
                min={100}
                max={4096}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
