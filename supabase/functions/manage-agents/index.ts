
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
    // Verificar se a requisição contém um corpo válido
    if (!req.body) {
      throw new Error("Corpo da requisição está vazio");
    }

    let bodyData;
    try {
      bodyData = await req.json();
    } catch (e) {
      console.error("Erro ao analisar JSON do corpo da requisição:", e);
      throw new Error("Formato de requisição inválido");
    }

    const { method, agentData } = bodyData;

    console.log(`Processando método: ${method}, dados:`, agentData);

    // Determinar qual operação executar com base no método recebido
    switch (method) {
      case "GET_ALL":
        const { data: agents, error: fetchError } = await supabase
          .from("agents")
          .select("*");

        if (fetchError) {
          console.error("Erro ao buscar agentes:", fetchError);
          throw new Error(fetchError.message);
        }
        
        console.log(`Encontrados ${agents?.length || 0} agentes`);
        
        return new Response(JSON.stringify({ success: true, data: agents || [] }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

      case "CREATE":
        if (!agentData) {
          throw new Error("Dados do agente não fornecidos");
        }

        const { data: newAgent, error: createError } = await supabase
          .from("agents")
          .insert([agentData])
          .select()
          .single();

        if (createError) {
          console.error("Erro ao criar agente:", createError);
          throw new Error(createError.message);
        }
        
        return new Response(JSON.stringify({ success: true, data: newAgent }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

      case "UPDATE":
        if (!agentData || !agentData.agent_id) {
          throw new Error("ID do agente não fornecido");
        }

        console.log("Atualizando agente com ID:", agentData.agent_id);
        
        const { data: updatedAgent, error: updateError } = await supabase
          .from("agents")
          .update(agentData)
          .eq("agent_id", agentData.agent_id)
          .select()
          .single();

        if (updateError) {
          console.error("Erro ao atualizar agente:", updateError);
          throw new Error(updateError.message);
        }
        
        return new Response(JSON.stringify({ success: true, data: updatedAgent }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

      case "DELETE":
        if (!agentData || !agentData.agent_id) {
          throw new Error("ID do agente não fornecido");
        }

        const { error: deleteError } = await supabase
          .from("agents")
          .delete()
          .eq("agent_id", agentData.agent_id);

        if (deleteError) {
          console.error("Erro ao excluir agente:", deleteError);
          throw new Error(deleteError.message);
        }
        
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

      default:
        throw new Error(`Método não suportado: ${method}`);
    }
  } catch (error) {
    console.error("Erro ao gerenciar agentes:", error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || "Erro desconhecido"
    }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
