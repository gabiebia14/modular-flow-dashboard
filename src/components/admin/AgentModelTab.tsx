
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui-custom/Card";
import { Label } from "@/components/ui/label";
import { Agent } from "@/types/agent";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

interface AgentModelTabProps {
  agent: Agent;
  onUpdate: (updatedAgent: Agent) => void;
}

export const AgentModelTab = ({ agent, onUpdate }: AgentModelTabProps) => {
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>(agent.model);
  const [temperature, setTemperature] = useState<number>(0.7);
  const [maxLength, setMaxLength] = useState<number>(2048);

  // Mapear o modelo atual para o provedor correspondente
  useEffect(() => {
    if (agent.model.startsWith("gpt-")) {
      setSelectedProvider("openai");
    } else if (agent.model.startsWith("gemini-")) {
      setSelectedProvider("google");
    } else if (agent.model.startsWith("deepseek-")) {
      setSelectedProvider("deepseek");
    }
    
    setSelectedModel(agent.model);
  }, [agent.model]);

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provider = e.target.value;
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
      case "deepseek":
        defaultModel = "deepseek-chat";
        break;
      default:
        defaultModel = "gpt-4o-mini";
    }
    
    setSelectedModel(defaultModel);
    
    // Atualizar o agente com o novo modelo
    onUpdate({
      ...agent,
      model: defaultModel as any
    });
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const model = e.target.value;
    setSelectedModel(model);
    
    // Atualizar o agente com o novo modelo
    onUpdate({
      ...agent,
      model: model as any
    });
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
              <select 
                className="w-full border border-input bg-background rounded-md p-2"
                value={selectedProvider}
                onChange={handleProviderChange}
              >
                <option value="">Selecione um provedor</option>
                <option value="openai">OpenAI</option>
                <option value="google">Google (Gemini)</option>
                <option value="deepseek">Deepseek</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Modelo</Label>
              <select 
                className="w-full border border-input bg-background rounded-md p-2"
                value={selectedModel}
                onChange={handleModelChange}
                disabled={!selectedProvider}
              >
                {selectedProvider === "openai" && (
                  <>
                    <option value="gpt-4o">GPT-4o</option>
                    <option value="gpt-4o-mini">GPT-4o Mini</option>
                  </>
                )}
                {selectedProvider === "google" && (
                  <>
                    <option value="gemini-pro">Gemini Pro</option>
                  </>
                )}
                {selectedProvider === "deepseek" && (
                  <>
                    <option value="deepseek-chat">Deepseek Chat</option>
                  </>
                )}
              </select>
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
