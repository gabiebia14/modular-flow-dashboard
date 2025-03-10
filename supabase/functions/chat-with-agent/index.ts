
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

    // Determinar o provedor com base no modelo
    let provider = '';
    if (agent.model.startsWith('gpt')) {
      provider = 'openai';
    } else if (agent.model.startsWith('gemini')) {
      provider = 'google';
    } else if (agent.model.startsWith('deepseek')) {
      provider = 'deepseek';
    } else {
      throw new Error(`Modelo não suportado: ${agent.model}`);
    }

    // Busca a chave de API correspondente ao modelo
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
    } else if (provider === 'google') {
      // Implementação para Google/Gemini
      const endpoint = apiKey.endpoint || "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";
      const apiKeyParam = `?key=${apiKey.api_key}`;
      
      // Formatar o histórico de conversa para o formato do Gemini
      const formattedHistory = conversationHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));
      
      // Adicionar a mensagem atual
      const contents = [
        ...formattedHistory,
        { role: 'user', parts: [{ text: message }] }
      ];
      
      // Adicionar o prompt do sistema como contexto no primeiro item se o histórico estiver vazio
      if (formattedHistory.length === 0) {
        contents.unshift({
          role: 'user',
          parts: [{ text: `${agent.prompt}\n\nMinha primeira pergunta é: ${message}` }]
        });
      }
      
      response = await fetch(`${endpoint}${apiKeyParam}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000
          }
        })
      });
    } else if (provider === 'deepseek') {
      // Implementação para Deepseek
      const endpoint = apiKey.endpoint || "https://api.deepseek.com/v1/chat/completions";
      
      const messages = [
        { role: "system", content: agent.prompt },
        ...conversationHistory.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        })),
        { role: "user", content: message }
      ];
      
      response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey.api_key}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages,
          temperature: 0.7,
          max_tokens: 1000
        })
      });
    }

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Erro na API do provedor:", errorData);
      throw new Error(`Erro no ${provider.toUpperCase()}: ${response.status} - ${errorData.error?.message || JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    let aiResponse = '';

    if (provider === 'openai') {
      aiResponse = data.choices[0].message.content;
    } else if (provider === 'google') {
      // Extrair resposta do formato do Gemini
      aiResponse = data.candidates[0].content.parts[0].text;
    } else if (provider === 'deepseek') {
      // Extrair resposta do formato do Deepseek (similar ao OpenAI)
      aiResponse = data.choices[0].message.content;
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
