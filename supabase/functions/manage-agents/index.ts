
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
      console.error("Corpo da requisição está vazio");
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
          console.error("Dados do agente não fornecidos");
          throw new Error("Dados do agente não fornecidos");
        }
        
        // Validar dados do agente
        if (!agentData.agent_id || !agentData.name || !agentData.prompt || !agentData.model || !agentData.type) {
          console.error("Campos obrigatórios não fornecidos", agentData);
          throw new Error("Campos obrigatórios não fornecidos: agent_id, name, prompt, model, type");
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
        
        console.log("Agente criado com sucesso:", newAgent);
        
        return new Response(JSON.stringify({ success: true, data: newAgent }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

      case "UPDATE":
        if (!agentData || !agentData.agent_id) {
          console.error("ID do agente não fornecido");
          throw new Error("ID do agente não fornecido");
        }
        
        // Validar dados do agente
        if (!agentData.name || !agentData.prompt || !agentData.model || !agentData.type) {
          console.error("Campos obrigatórios não fornecidos", agentData);
          throw new Error("Campos obrigatórios não fornecidos: name, prompt, model, type");
        }

        console.log("Atualizando agente com ID:", agentData.agent_id);
        
        // Primeiro verifica se o agente existe
        const { data: existingAgent, error: checkError } = await supabase
          .from("agents")
          .select("*")
          .eq("agent_id", agentData.agent_id)
          .single();
          
        if (checkError) {
          if (checkError.code === "PGRST116") {
            // Não encontrado, então vamos inserir
            console.log("Agente não encontrado, criando novo...");
            
            // Adicionar timestamps
            agentData.created_at = new Date().toISOString();
            agentData.updated_at = new Date().toISOString();
            
            const { data: insertedAgent, error: insertError } = await supabase
              .from("agents")
              .insert([agentData])
              .select()
              .single();
              
            if (insertError) {
              console.error("Erro ao inserir agente:", insertError);
              throw new Error(insertError.message);
            }
            
            console.log("Agente inserido com sucesso:", insertedAgent);
            
            return new Response(JSON.stringify({ success: true, data: insertedAgent }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          } else {
            // Outro erro ao verificar
            console.error("Erro ao verificar existência do agente:", checkError);
            throw new Error(checkError.message);
          }
        }
        
        // Atualizar os campos
        agentData.updated_at = new Date().toISOString();
        
        // Fazer log dos dados
        console.log("Dados a serem atualizados:", JSON.stringify(agentData, null, 2));
        
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
        
        console.log("Agente atualizado com sucesso:", updatedAgent);
        
        return new Response(JSON.stringify({ success: true, data: updatedAgent }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

      case "DELETE":
        if (!agentData || !agentData.agent_id) {
          console.error("ID do agente não fornecido");
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
        
        console.log("Agente excluído com sucesso:", agentData.agent_id);
        
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

      default:
        console.error(`Método não suportado: ${method}`);
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
