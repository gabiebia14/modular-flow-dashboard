
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui-custom/Card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertCircle, KeyRound, Loader2, Server } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const AgentApiTab = () => {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState("");
  const [apiEndpoint, setApiEndpoint] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("openai");
  const [isSavingApiKey, setIsSavingApiKey] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  
  const handleSaveApiKey = async () => {
    if (!apiKey || !selectedProvider) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSavingApiKey(true);
    
    try {
      const apiKeyData = {
        provider: selectedProvider,
        api_key: apiKey,
        endpoint: apiEndpoint || null,
        active: true
      };
      
      const response = await supabase.functions.invoke('manage-api-keys', {
        body: { 
          method: 'SAVE',
          apiKeyData
        }
      });
      
      if (response.data.success) {
        toast({
          title: "Chave de API salva",
          description: `A chave de API para ${selectedProvider} foi salva com sucesso.`,
          variant: "default",
        });
        
        // Limpar campos
        setApiKey("");
        setApiEndpoint("");
      } else {
        throw new Error(response.data.error || "Erro desconhecido");
      }
    } catch (error) {
      console.error("Erro ao salvar chave de API:", error);
      toast({
        title: "Erro ao salvar",
        description: `Não foi possível salvar a chave de API: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsSavingApiKey(false);
    }
  };
  
  const handleTestConnection = async () => {
    if (!selectedProvider) return;
    
    setIsTestingConnection(true);
    
    try {
      const response = await supabase.functions.invoke('manage-api-keys', {
        body: { 
          method: 'TEST_CONNECTION',
          apiKeyData: { provider: selectedProvider }
        }
      });
      
      if (response.data.success) {
        toast({
          title: "Conexão bem-sucedida",
          description: `A conexão com a API de ${selectedProvider} foi testada com sucesso.`,
          variant: "default",
        });
      } else {
        throw new Error("Falha no teste de conexão");
      }
    } catch (error) {
      console.error("Erro ao testar conexão:", error);
      toast({
        title: "Falha na conexão",
        description: `Não foi possível conectar à API de ${selectedProvider}. Verifique a chave e o endpoint.`,
        variant: "destructive",
      });
    } finally {
      setIsTestingConnection(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Chaves de API</CardTitle>
            <div className="flex items-center space-x-2 text-sm">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <span className="text-muted-foreground">As chaves são armazenadas de forma segura</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Provedor</Label>
                <select 
                  className="w-full border border-input bg-background rounded-md p-2"
                  value={selectedProvider}
                  onChange={(e) => setSelectedProvider(e.target.value)}
                >
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic</option>
                  <option value="google">Google</option>
                </select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Chave de API</Label>
                <Input 
                  type="password" 
                  placeholder="sk-..." 
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Endpoint da API (opcional)</Label>
              <Input 
                type="text" 
                placeholder="https://api.example.com/v1" 
                value={apiEndpoint}
                onChange={(e) => setApiEndpoint(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Deixe em branco para usar o endpoint padrão do provedor.
              </p>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={handleTestConnection}
                disabled={isTestingConnection || !selectedProvider}
              >
                {isTestingConnection ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Testando...
                  </>
                ) : (
                  <>
                    <Server className="h-4 w-4 mr-2" />
                    Testar Conexão
                  </>
                )}
              </Button>
              <Button 
                onClick={handleSaveApiKey}
                disabled={isSavingApiKey || !apiKey || !selectedProvider}
              >
                {isSavingApiKey ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <KeyRound className="h-4 w-4 mr-2" />
                    Salvar Chave
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
