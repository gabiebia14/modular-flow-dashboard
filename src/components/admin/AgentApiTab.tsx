
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui-custom/Card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertCircle, KeyRound, Loader2, Server, Info, Trash2, Eye, EyeOff, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ApiKey } from "@/types/agent";

export const AgentApiTab = () => {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState("");
  const [apiEndpoint, setApiEndpoint] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("openai");
  const [isSavingApiKey, setIsSavingApiKey] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [existingKeys, setExistingKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showApiKey, setShowApiKey] = useState(false);
  const [selectedKeyId, setSelectedKeyId] = useState<string | null>(null);
  
  // Carregar chaves de API existentes ao iniciar
  useEffect(() => {
    loadExistingKeys();
  }, []);
  
  // Carregar chaves existentes
  const loadExistingKeys = async () => {
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
        setExistingKeys(response.data.data);
        console.log("Chaves encontradas:", response.data.data);
        
        // Se não houver chave Gemini, vamos adicionar uma como exemplo
        const hasGeminiKey = response.data.data.some((key: ApiKey) => key.provider === "google");
        if (!hasGeminiKey) {
          console.log("Adicionando chave Gemini de exemplo...");
          await addGeminiExample();
        }
      } else {
        console.error("Formato de resposta inesperado:", response);
        toast({
          title: "Erro ao carregar configurações",
          description: "Não foi possível carregar as chaves de API existentes.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao carregar chaves:", error);
      toast({
        title: "Erro ao carregar configurações",
        description: "Ocorreu um erro ao buscar as chaves de API.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Adicionar chave Gemini de exemplo
  const addGeminiExample = async () => {
    try {
      const apiKeyData = {
        provider: "google",
        api_key: "AIzaSyDGn-tVSe97uGLUzRjh1-0o2IrCNTPiyjw", // Chave fornecida pelo usuário
        endpoint: "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
        model_type: "gemini",
        model_version: "pro",
        active: true
      };
      
      const response = await supabase.functions.invoke('manage-api-keys', {
        body: { 
          method: 'SAVE',
          apiKeyData
        }
      });
      
      if (response.data && response.data.success) {
        console.log("Chave Gemini adicionada com sucesso:", response.data);
        toast({
          title: "Chave de exemplo adicionada",
          description: "A chave de API para Gemini foi adicionada como exemplo.",
          variant: "default",
        });
        
        // Atualizar lista de chaves
        await loadExistingKeys();
      } else {
        console.error("Erro ao adicionar chave Gemini de exemplo:", response);
      }
    } catch (error) {
      console.error("Erro ao adicionar chave Gemini de exemplo:", error);
    }
  };
  
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
    setSelectedKeyId(null); // Limpar seleção de chave existente ao mudar o provedor
  };
  
  const handleSaveApiKey = async () => {
    if (!apiKey && !selectedKeyId) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, insira uma chave de API ou selecione uma existente.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSavingApiKey(true);
    
    try {
      let modelType = "";
      let modelVersion = "";
      let keyToUse = apiKey;
      
      // Se uma chave existente foi selecionada, use-a
      if (selectedKeyId) {
        const selectedKey = existingKeys.find(k => k.id === selectedKeyId);
        if (selectedKey) {
          keyToUse = selectedKey.api_key;
          modelType = selectedKey.model_type || "";
          modelVersion = selectedKey.model_version || "";
        }
      } else {
        // Configure o tipo e versão do modelo com base no provedor
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
      }
      
      const apiKeyData = {
        provider: selectedProvider,
        api_key: keyToUse,
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
        
        // Limpar campos e atualizar lista
        setApiKey("");
        setSelectedKeyId(null);
        await loadExistingKeys();
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
  
  const handleSelectExistingKey = (keyId: string) => {
    setSelectedKeyId(keyId === selectedKeyId ? null : keyId);
    setApiKey(""); // Limpar o campo de entrada de chave ao selecionar uma existente
  };
  
  const handleRemoveProvider = async (keyId: string) => {
    if (!keyId) return;
    
    try {
      const deleteResponse = await supabase.functions.invoke('manage-api-keys', {
        body: { 
          method: 'DELETE',
          apiKeyData: { id: keyId }
        }
      });
      
      if (deleteResponse.data && deleteResponse.data.success) {
        toast({
          title: "Chave removida",
          description: "A chave de API foi removida com sucesso.",
          variant: "default",
        });
        
        // Atualizar lista de chaves existentes
        await loadExistingKeys();
        
        // Se a chave selecionada foi removida, limpar seleção
        if (selectedKeyId === keyId) {
          setSelectedKeyId(null);
        }
      } else {
        throw new Error(deleteResponse.error || "Erro ao excluir a chave");
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
  
  // Filtrar chaves pelo provedor selecionado
  const keysForSelectedProvider = existingKeys.filter(key => key.provider === selectedProvider);
  
  // Verificar se já existe uma chave para o provedor selecionado
  const providerHasKey = existingKeys.some(key => key.provider === selectedProvider);
  
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
                {providerHasKey && (
                  <div className="flex items-center mt-1 text-xs text-blue-500">
                    <Info className="h-3 w-3 mr-1" />
                    <span>Chaves disponíveis para este provedor</span>
                  </div>
                )}
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="flex justify-between">
                  <span>Chave de API</span>
                  {apiKey && (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      className="h-5 px-1" 
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </Button>
                  )}
                </Label>
                <Input 
                  type={showApiKey ? "text" : "password"}
                  placeholder={selectedProvider === "openai" ? "sk-..." : selectedProvider === "google" ? "AIza..." : "dsk-..."}
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    setSelectedKeyId(null); // Limpar seleção ao digitar
                  }}
                  disabled={!!selectedKeyId}
                />
              </div>
            </div>
            
            {/* Chaves existentes para seleção */}
            {keysForSelectedProvider.length > 0 && (
              <div className="space-y-2">
                <Label>Chaves Existentes</Label>
                <div className="grid grid-cols-1 gap-2">
                  {keysForSelectedProvider.map(key => (
                    <div 
                      key={key.id} 
                      className={`p-3 border rounded-md flex items-center justify-between cursor-pointer transition-colors ${
                        selectedKeyId === key.id 
                          ? 'bg-primary/10 border-primary' 
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => handleSelectExistingKey(key.id)}
                    >
                      <div className="flex items-center space-x-2">
                        <KeyRound className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">
                            {key.provider.charAt(0).toUpperCase() + key.provider.slice(1)}
                            {key.model_version ? ` (${key.model_version})` : ''}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {key.endpoint ? 'Endpoint personalizado' : 'Endpoint padrão'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {selectedKeyId === key.id && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveProvider(key.id);
                          }}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
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
                disabled={isTestingConnection || !providerHasKey}
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
                disabled={isSavingApiKey || (!apiKey && !selectedKeyId)}
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
              {existingKeys.length > 0 ? (
                existingKeys.map((key) => (
                  <div 
                    key={key.id} 
                    className="p-4 border rounded-md flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                      <div>
                        <div className="font-medium">
                          {key.provider.charAt(0).toUpperCase() + key.provider.slice(1)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {key.model_type && key.model_version 
                            ? `${key.model_type.toUpperCase()} ${key.model_version}` 
                            : 'Configuração padrão'}
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleRemoveProvider(key.id)}
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
