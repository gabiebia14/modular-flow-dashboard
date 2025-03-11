
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui-custom/Card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertCircle, KeyRound, Loader2, Server, Info, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const AgentApiTab = () => {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState("");
  const [apiEndpoint, setApiEndpoint] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("openai");
  const [isSavingApiKey, setIsSavingApiKey] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [existingProviders, setExistingProviders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Carregar provedores existentes
    const loadExistingProviders = async () => {
      setIsLoading(true);
      try {
        console.log("Buscando chaves de API existentes...");
        const response = await supabase.functions.invoke('manage-api-keys', {
          body: { 
            method: 'GET_ALL'
          }
        });
        
        console.log("Resposta da busca de chaves:", response);
        
        if (response.data && response.data.success && Array.isArray(response.data.data)) {
          const providers = response.data.data.map((key: any) => key.provider);
          setExistingProviders(providers);
          console.log("Provedores encontrados:", providers);
        } else {
          console.error("Formato de resposta inesperado:", response);
          toast({
            title: "Erro ao carregar configurações",
            description: "Não foi possível carregar as chaves de API existentes.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Erro ao carregar provedores:", error);
        toast({
          title: "Erro ao carregar configurações",
          description: "Ocorreu um erro ao buscar as chaves de API.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadExistingProviders();
  }, [toast]);
  
  // Ajustar endpoint padrão com base no provedor selecionado
  useEffect(() => {
    switch(selectedProvider) {
      case "openai":
        setApiEndpoint("https://api.openai.com/v1/chat/completions");
        break;
      case "google":
        setApiEndpoint("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent");
        break;
      case "deepseek":
        setApiEndpoint("https://api.deepseek.com/v1/chat/completions");
        break;
      default:
        setApiEndpoint("");
    }
  }, [selectedProvider]);

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProvider(e.target.value);
  };
  
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
      let modelType = "";
      let modelVersion = "";
      
      switch(selectedProvider) {
        case "openai":
          modelType = "gpt";
          modelVersion = "4o";
          break;
        case "google":
          modelType = "gemini";
          modelVersion = "pro";
          break;
        case "deepseek":
          modelType = "deepseek";
          modelVersion = "chat";
          break;
      }
      
      const apiKeyData = {
        provider: selectedProvider,
        api_key: apiKey,
        endpoint: apiEndpoint || null,
        model_type: modelType,
        model_version: modelVersion,
        active: true
      };
      
      console.log("Enviando solicitação para salvar chave:", {
        provider: apiKeyData.provider,
        endpoint: apiKeyData.endpoint,
        model_type: apiKeyData.model_type
      });
      
      const response = await supabase.functions.invoke('manage-api-keys', {
        body: { 
          method: 'SAVE',
          apiKeyData
        }
      });
      
      console.log("Resposta da função de salvar chave:", response);
      
      if (response.data && response.data.success) {
        toast({
          title: "Chave de API salva",
          description: `A chave de API para ${selectedProvider} foi salva com sucesso.`,
          variant: "default",
        });
        
        // Atualizar lista de provedores existentes
        if (!existingProviders.includes(selectedProvider)) {
          setExistingProviders([...existingProviders, selectedProvider]);
        }
        
        // Limpar campos
        setApiKey("");
      } else {
        const errorMessage = response.error || (response.data && response.data.error) || "Erro desconhecido";
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Erro ao salvar chave de API:", error);
      toast({
        title: "Erro ao salvar",
        description: `Não foi possível salvar a chave de API: ${error.message || "Erro desconhecido"}`,
        variant: "destructive",
      });
    } finally {
      setIsSavingApiKey(false);
    }
  };
  
  const handleRemoveProvider = async (provider: string) => {
    if (!provider) return;
    
    try {
      // Primeiro precisamos obter o ID da chave que queremos remover
      const response = await supabase.functions.invoke('manage-api-keys', {
        body: { 
          method: 'GET_ALL'
        }
      });
      
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        const keyToDelete = response.data.data.find((key: any) => key.provider === provider);
        
        if (keyToDelete) {
          const deleteResponse = await supabase.functions.invoke('manage-api-keys', {
            body: { 
              method: 'DELETE',
              apiKeyData: { id: keyToDelete.id }
            }
          });
          
          if (deleteResponse.data && deleteResponse.data.success) {
            toast({
              title: "Chave removida",
              description: `A chave de API para ${provider} foi removida com sucesso.`,
              variant: "default",
            });
            
            // Atualizar lista de provedores existentes
            setExistingProviders(existingProviders.filter(p => p !== provider));
          } else {
            throw new Error(deleteResponse.error || "Erro ao excluir a chave");
          }
        }
      } else {
        throw new Error("Não foi possível obter as chaves existentes");
      }
    } catch (error) {
      console.error("Erro ao remover provedor:", error);
      toast({
        title: "Erro ao remover",
        description: `Não foi possível remover a chave de API: ${error.message}`,
        variant: "destructive",
      });
    }
  };
  
  const handleTestConnection = async () => {
    if (!selectedProvider) return;
    
    setIsTestingConnection(true);
    
    try {
      console.log("Testando conexão para provedor:", selectedProvider);
      const response = await supabase.functions.invoke('manage-api-keys', {
        body: { 
          method: 'TEST_CONNECTION',
          apiKeyData: { provider: selectedProvider }
        }
      });
      
      console.log("Resposta do teste de conexão:", response);
      
      if (response.data && response.data.success) {
        toast({
          title: "Conexão bem-sucedida",
          description: `A conexão com a API de ${selectedProvider} foi testada com sucesso.`,
          variant: "default",
        });
      } else {
        const errorMessage = response.error || (response.data && response.data.error) || "Falha no teste de conexão";
        throw new Error(errorMessage);
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
                  onChange={handleProviderChange}
                >
                  <option value="openai">OpenAI</option>
                  <option value="google">Google (Gemini)</option>
                  <option value="deepseek">Deepseek</option>
                </select>
                {existingProviders.includes(selectedProvider) && (
                  <div className="flex items-center mt-1 text-xs text-blue-500">
                    <Info className="h-3 w-3 mr-1" />
                    <span>Chave já configurada para este provedor</span>
                  </div>
                )}
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Chave de API</Label>
                <Input 
                  type="password" 
                  placeholder={selectedProvider === "openai" ? "sk-..." : selectedProvider === "google" ? "AIza..." : "dsk-..."}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Endpoint da API</Label>
              <Input 
                type="text" 
                placeholder="URL do endpoint da API"
                value={apiEndpoint}
                onChange={(e) => setApiEndpoint(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Endpoint padrão do provedor será usado se deixado em branco.
              </p>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={handleTestConnection}
                disabled={isTestingConnection || !existingProviders.includes(selectedProvider)}
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
      
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Provedores Configurados</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Carregando...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {existingProviders.length > 0 ? (
                existingProviders.map((provider) => (
                  <div 
                    key={provider} 
                    className="p-4 border rounded-md flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                      <span className="font-medium">{provider.charAt(0).toUpperCase() + provider.slice(1)}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleRemoveProvider(provider)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-4 text-muted-foreground">
                  Nenhum provedor configurado ainda
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
