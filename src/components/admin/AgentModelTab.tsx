
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui-custom/Card";
import { Label } from "@/components/ui/label";
import { Agent } from "@/types/agent";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface AgentModelTabProps {
  agent: Agent;
  onUpdate: (updatedAgent: Agent) => void;
}

export const AgentModelTab = ({ agent, onUpdate }: AgentModelTabProps) => {
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>(agent.model);
  const [temperature, setTemperature] = useState<number>(0.7);
  const [maxLength, setMaxLength] = useState<number>(2048);
  const [isUpdating, setIsUpdating] = useState(false);
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
  };

  const handleModelChange = (value: string) => {
    const model = value;
    setSelectedModel(model);
  };
  
  const applyModelChanges = async () => {
    if (!selectedModel) {
      toast({
        title: "Modelo não selecionado",
        description: "Por favor, selecione um modelo antes de aplicar as alterações.",
        variant: "destructive",
      });
      return;
    }
    
    setIsUpdating(true);
    
    try {
      // Para o agente atendimento, forçar o uso do modelo gemini-pro se o provedor for Google
      let modelToUse = selectedModel;
      
      // Se o provedor não for "openai" ou "anthropic", vamos adaptá-lo para um modelo compatível
      // já que nosso tipo Agent só permite alguns modelos específicos
      if (!["gpt-4o", "gpt-4o-mini", "claude-3-haiku", "claude-3-sonnet"].includes(modelToUse)) {
        // Mapeamento para um modelo compatível com nosso tipo Agent
        if (selectedProvider === "google") {
          modelToUse = "gpt-4o-mini"; // Usamos isto como proxy para o Gemini no frontend
        } else if (selectedProvider === "deepseek") {
          modelToUse = "gpt-4o-mini"; // Usamos isto como proxy para o Deepseek no frontend
        }
        
        toast({
          title: "Adaptação de modelo",
          description: `O modelo ${selectedModel} foi mapeado para ${modelToUse} no frontend. A API ainda usará ${selectedProvider} como provedor.`,
          variant: "default",
        });
      }
      
      // Atualizar o agente com o novo modelo
      onUpdate({
        ...agent,
        model: modelToUse as any
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
    } finally {
      setIsUpdating(false);
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
          
          <div className="mt-4">
            <Button onClick={applyModelChanges} disabled={isUpdating || !selectedModel}>
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Atualizando...
                </>
              ) : (
                "Aplicar Modelo"
              )}
            </Button>
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
