
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
    const { agentId, message, conversationHistory = [] } = await req.json();

    // Busca o agente pelo ID
    const { data: agent, error: agentError } = await supabase
      .from("agents")
      .select("*")
      .eq("agent_id", agentId)
      .single();

    if (agentError) throw new Error(`Agente não encontrado: ${agentError.message}`);
    if (!agent.active) throw new Error("Este agente está desativado");

    // Busca a chave de API correspondente ao modelo
    let provider = '';
    if (agent.model.startsWith('gpt')) {
      provider = 'openai';
    } else if (agent.model.startsWith('claude')) {
      provider = 'anthropic';
    } else {
      throw new Error(`Modelo não suportado: ${agent.model}`);
    }

    const { data: apiKey, error: apiKeyError } = await supabase
      .from("api_keys")
      .select("api_key, endpoint")
      .eq("provider", provider)
      .single();

    if (apiKeyError) throw new Error(`Chave de API para ${provider} não encontrada`);

    // Prepara o histórico de conversa e mensagem do sistema
    let response;

    if (provider === 'openai') {
      const messages = [
        { role: "system", content: agent.prompt },
        ...conversationHistory.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        })),
        { role: "user", content: message }
      ];

      const endpoint = apiKey.endpoint || "https://api.openai.com/v1/chat/completions";
      response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey.api_key}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: agent.model,
          messages,
          temperature: 0.7,
          max_tokens: 1000
        })
      });
    } else if (provider === 'anthropic') {
      const systemPrompt = agent.prompt;
      const formattedHistory = conversationHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      const endpoint = apiKey.endpoint || "https://api.anthropic.com/v1/messages";
      response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "x-api-key": apiKey.api_key,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: agent.model,
          system: systemPrompt,
          messages: [
            ...formattedHistory,
            { role: "user", content: message }
          ],
          max_tokens: 1000
        })
      });
    }

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Erro na API do provedor:", errorData);
      throw new Error(`Erro no ${provider.toUpperCase()}: ${response.status}`);
    }

    const data = await response.json();
    let aiResponse = '';

    if (provider === 'openai') {
      aiResponse = data.choices[0].message.content;
    } else if (provider === 'anthropic') {
      aiResponse = data.content[0].text;
    }

    return new Response(JSON.stringify({ 
      success: true, 
      response: aiResponse 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Erro ao processar chat com agente:", error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
