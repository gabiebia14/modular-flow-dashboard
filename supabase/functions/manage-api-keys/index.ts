
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
    const { method, apiKeyData } = await req.json();

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
        // Verifica se já existe uma chave para este provedor
        const { data: existingKey } = await supabase
          .from("api_keys")
          .select("id")
          .eq("provider", apiKeyData.provider)
          .maybeSingle();

        let result;
        
        if (existingKey) {
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

          if (updateError) throw new Error(updateError.message);
          result = data;
        } else {
          // Cria uma nova chave
          const { data, error: insertError } = await supabase
            .from("api_keys")
            .insert([apiKeyData])
            .select("id, provider, endpoint, model_type, model_version, active, created_at, updated_at")
            .single();

          if (insertError) throw new Error(insertError.message);
          result = data;
        }
        
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
        
        if (keyData.provider === "openai") {
          const endpoint = keyData.endpoint || "https://api.openai.com/v1/models";
          const response = await fetch(endpoint, {
            headers: {
              "Authorization": `Bearer ${keyData.api_key}`,
              "Content-Type": "application/json"
            }
          });
          testResult = response.status < 300;
        } else if (keyData.provider === "google") {
          // Para o Google, testamos listando modelos
          const baseUrl = "https://generativelanguage.googleapis.com/v1beta/models";
          const apiKeyParam = `?key=${keyData.api_key}`;
          const response = await fetch(`${baseUrl}${apiKeyParam}`);
          testResult = response.status < 300;
        } else if (keyData.provider === "deepseek") {
          // Para o Deepseek, testamos com uma requisição simples
          const endpoint = keyData.endpoint || "https://api.deepseek.com/v1/models";
          const response = await fetch(endpoint, {
            headers: {
              "Authorization": `Bearer ${keyData.api_key}`,
              "Content-Type": "application/json"
            }
          });
          testResult = response.status < 300;
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
      error: error.message 
    }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
