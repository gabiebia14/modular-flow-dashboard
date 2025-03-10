
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
    const { method, agentData } = await req.json();

    // Determinar qual operação executar com base no método recebido
    switch (method) {
      case "GET_ALL":
        const { data: agents, error: fetchError } = await supabase
          .from("agents")
          .select("*");

        if (fetchError) throw new Error(fetchError.message);
        
        return new Response(JSON.stringify({ success: true, data: agents }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

      case "CREATE":
        const { data: newAgent, error: createError } = await supabase
          .from("agents")
          .insert([agentData])
          .select()
          .single();

        if (createError) throw new Error(createError.message);
        
        return new Response(JSON.stringify({ success: true, data: newAgent }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

      case "UPDATE":
        const { data: updatedAgent, error: updateError } = await supabase
          .from("agents")
          .update(agentData)
          .eq("agent_id", agentData.agent_id)
          .select()
          .single();

        if (updateError) throw new Error(updateError.message);
        
        return new Response(JSON.stringify({ success: true, data: updatedAgent }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

      case "DELETE":
        const { error: deleteError } = await supabase
          .from("agents")
          .delete()
          .eq("agent_id", agentData.agent_id);

        if (deleteError) throw new Error(deleteError.message);
        
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

      default:
        throw new Error("Método não suportado");
    }
  } catch (error) {
    console.error("Erro ao gerenciar agentes:", error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
