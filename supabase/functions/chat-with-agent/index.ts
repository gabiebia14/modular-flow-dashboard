
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
    console.log(`Processando mensagem para agente: ${agentId}`, { message, historyLength: conversationHistory.length });

    // Busca o agente pelo ID
    const { data: agent, error: agentError } = await supabase
      .from("agents")
      .select("*")
      .eq("agent_id", agentId)
      .single();

    if (agentError) {
      console.error(`Erro ao buscar agente ${agentId}:`, agentError);
      throw new Error(`Agente não encontrado: ${agentError.message}`);
    }
    
    if (!agent.active) {
      console.error(`Agente ${agentId} está desativado`);
      throw new Error("Este agente está desativado");
    }

    console.log(`Agente encontrado: ${agent.name}, modelo: ${agent.model}`);

    // Determinar o provedor com base no modelo
    let provider = '';
    let actualModel = agent.model;
    
    if (agent.model.startsWith('gpt')) {
      provider = 'openai';
    } else if (agent.model.startsWith('claude')) {
      provider = 'anthropic';
    } else if (agent.model.startsWith('gemini')) {
      provider = 'google';
    } else if (agent.model.startsWith('deepseek')) {
      provider = 'deepseek';
    } else {
      // Verificar se é um dos casos especiais onde estamos usando um modelo como proxy
      if (agent.type === 'atendimento') {
        provider = 'google';
        actualModel = 'gemini-pro';
        console.log(`Usando modelo Gemini Pro para o agente de atendimento`);
      } else {
        console.error(`Modelo não reconhecido: ${agent.model}`);
        throw new Error(`Modelo não suportado: ${agent.model}`);
      }
    }

    // Busca a chave de API correspondente ao modelo
    const { data: apiKey, error: apiKeyError } = await supabase
      .from("api_keys")
      .select("api_key, endpoint")
      .eq("provider", provider)
      .single();

    if (apiKeyError) {
      console.error(`Erro ao buscar chave de API para ${provider}:`, apiKeyError);
      throw new Error(`Chave de API para ${provider} não encontrada`);
    }

    console.log(`Chave de API encontrada para ${provider}`);

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
      console.log(`Enviando requisição para OpenAI: ${endpoint}`);
      
      response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey.api_key}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: actualModel,
          messages,
          temperature: 0.7,
          max_tokens: 1000
        })
      });
    } else if (provider === 'anthropic') {
      // Implementação para Claude/Anthropic
      const endpoint = apiKey.endpoint || "https://api.anthropic.com/v1/messages";
      
      // Formatar mensagens para o formato Claude
      const systemPrompt = agent.prompt;
      const userMessages = conversationHistory
        .filter(msg => msg.role === 'user')
        .map(msg => msg.content);
      const assistantMessages = conversationHistory
        .filter(msg => msg.role === 'assistant')
        .map(msg => msg.content);
      
      let messages = [];
      for (let i = 0; i < Math.max(userMessages.length, assistantMessages.length); i++) {
        if (i < userMessages.length) {
          messages.push({ role: "user", content: userMessages[i] });
        }
        if (i < assistantMessages.length) {
          messages.push({ role: "assistant", content: assistantMessages[i] });
        }
      }
      
      // Adicionar a mensagem atual
      messages.push({ role: "user", content: message });
      
      console.log(`Enviando requisição para Anthropic: ${endpoint}`);
      
      response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "x-api-key": apiKey.api_key,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: actualModel,
          system: systemPrompt,
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
      
      console.log(`Enviando requisição para Google Gemini: ${endpoint}${apiKeyParam}`);
      console.log("Contents:", JSON.stringify(contents, null, 2).substring(0, 500) + "...");
      
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
      
      console.log(`Enviando requisição para Deepseek: ${endpoint}`);
      
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
      console.error(`Erro na API do ${provider}:`, errorData);
      console.error(`Status: ${response.status}`);
      throw new Error(`Erro no ${provider.toUpperCase()}: ${response.status} - ${errorData.error?.message || JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    let aiResponse = '';

    console.log(`Resposta recebida de ${provider}:`, JSON.stringify(data).substring(0, 500) + "...");

    if (provider === 'openai') {
      aiResponse = data.choices[0].message.content;
    } else if (provider === 'anthropic') {
      // Extrair resposta do formato do Claude
      aiResponse = data.content[0].text;
    } else if (provider === 'google') {
      // Extrair resposta do formato do Gemini
      if (data.candidates && data.candidates.length > 0 && 
          data.candidates[0].content && data.candidates[0].content.parts && 
          data.candidates[0].content.parts.length > 0) {
        aiResponse = data.candidates[0].content.parts[0].text;
      } else {
        console.error("Formato de resposta do Gemini inesperado:", data);
        throw new Error("Não foi possível extrair a resposta do Gemini");
      }
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
