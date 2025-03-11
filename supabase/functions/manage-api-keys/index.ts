
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Lidar com requisições OPTIONS para CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Obtenha as credenciais do Supabase das variáveis de ambiente
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // Verifica se o corpo da requisição existe
    if (!req.body) {
      throw new Error("Corpo da requisição está vazio");
    }

    const body = await req.json();
    const { method, apiKeyData } = body;

    console.log(`Recebendo solicitação método: ${method}, dados:`, apiKeyData);

    // Determinar qual operação executar com base no método recebido
    switch (method) {
      case "GET_ALL":
        // Retorna apenas metadados das chaves de API, não as chaves em si
        const { data: apiKeys, error: fetchError } = await supabase
          .from("api_keys")
          .select("id, provider, endpoint, model_type, model_version, active, created_at, updated_at");

        if (fetchError) throw new Error(fetchError.message);
        
        return new Response(JSON.stringify({ success: true, data: apiKeys }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

      case "SAVE":
        // Validação dos dados recebidos
        if (!apiKeyData || !apiKeyData.provider || !apiKeyData.api_key) {
          throw new Error("Dados incompletos para salvar a chave de API");
        }

        console.log("Tentando salvar chave para o provedor:", apiKeyData.provider);

        // Verifica se já existe uma chave para este provedor
        const { data: existingKey, error: findError } = await supabase
          .from("api_keys")
          .select("id")
          .eq("provider", apiKeyData.provider)
          .maybeSingle();

        if (findError) {
          console.error("Erro ao verificar chave existente:", findError);
          throw new Error(`Erro ao verificar chave existente: ${findError.message}`);
        }

        let result;
        
        if (existingKey) {
          console.log("Atualizando chave existente para o provedor:", apiKeyData.provider);
          // Atualiza a chave existente
          const { data, error: updateError } = await supabase
            .from("api_keys")
            .update({
              api_key: apiKeyData.api_key,
              endpoint: apiKeyData.endpoint,
              model_type: apiKeyData.model_type,
              model_version: apiKeyData.model_version,
              active: apiKeyData.active,
              updated_at: new Date().toISOString()
            })
            .eq("id", existingKey.id)
            .select("id, provider, endpoint, model_type, model_version, active, created_at, updated_at")
            .single();

          if (updateError) {
            console.error("Erro ao atualizar chave:", updateError);
            throw new Error(updateError.message);
          }
          result = data;
        } else {
          console.log("Criando nova chave para o provedor:", apiKeyData.provider);
          // Cria uma nova chave
          const { data, error: insertError } = await supabase
            .from("api_keys")
            .insert([{
              provider: apiKeyData.provider,
              api_key: apiKeyData.api_key,
              endpoint: apiKeyData.endpoint || null,
              model_type: apiKeyData.model_type || null,
              model_version: apiKeyData.model_version || null,
              active: apiKeyData.active || true
            }])
            .select("id, provider, endpoint, model_type, model_version, active, created_at, updated_at")
            .single();

          if (insertError) {
            console.error("Erro ao inserir chave:", insertError);
            throw new Error(insertError.message);
          }
          result = data;
        }
        
        console.log("Chave salva com sucesso:", result ? result.provider : null);
        
        return new Response(JSON.stringify({ success: true, data: result }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

      case "DELETE":
        const { error: deleteError } = await supabase
          .from("api_keys")
          .delete()
          .eq("id", apiKeyData.id);

        if (deleteError) throw new Error(deleteError.message);
        
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

      case "TEST_CONNECTION":
        // Busca a chave de API para teste
        const { data: keyData, error: keyError } = await supabase
          .from("api_keys")
          .select("api_key, endpoint, provider")
          .eq("provider", apiKeyData.provider)
          .single();

        if (keyError) throw new Error("Chave de API não encontrada");

        // Implementa um teste específico para cada provedor
        let testResult = false;
        let testResponse;
        
        try {
          if (keyData.provider === "openai") {
            const endpoint = keyData.endpoint || "https://api.openai.com/v1/models";
            testResponse = await fetch(endpoint, {
              headers: {
                "Authorization": `Bearer ${keyData.api_key}`,
                "Content-Type": "application/json"
              }
            });
            testResult = testResponse.status < 300;
          } else if (keyData.provider === "google") {
            // Para o Google, testamos listando modelos
            const baseUrl = "https://generativelanguage.googleapis.com/v1beta/models";
            const apiKeyParam = `?key=${keyData.api_key}`;
            testResponse = await fetch(`${baseUrl}${apiKeyParam}`);
            testResult = testResponse.status < 300;
          } else if (keyData.provider === "deepseek") {
            // Para o Deepseek, testamos com uma requisição simples
            const endpoint = keyData.endpoint || "https://api.deepseek.com/v1/models";
            testResponse = await fetch(endpoint, {
              headers: {
                "Authorization": `Bearer ${keyData.api_key}`,
                "Content-Type": "application/json"
              }
            });
            testResult = testResponse.status < 300;
          }
          
          console.log(`Teste de conexão para ${keyData.provider}: ${testResult ? 'Sucesso' : 'Falha'}`);
          
        } catch (fetchError) {
          console.error(`Erro ao testar conexão para ${keyData.provider}:`, fetchError);
          testResult = false;
        }
        
        return new Response(JSON.stringify({ success: testResult }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

      default:
        throw new Error("Método não suportado");
    }
  } catch (error) {
    console.error("Erro ao gerenciar chaves de API:", error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || "Erro desconhecido"
    }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
