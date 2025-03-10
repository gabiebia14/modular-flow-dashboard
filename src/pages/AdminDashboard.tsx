
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeftCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AgentCard } from "@/components/admin/AgentCard";
import { AgentTabs } from "@/components/admin/AgentTabs";
import { useAgents } from "@/hooks/useAgents";
import { Agent } from "@/types/agent";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  
  const { 
    agents, 
    isLoading, 
    activeAgentId, 
    setActiveAgentId,
    saveAgent,
    setAgents
  } = useAgents();
  
  const activeAgent = agents.find(a => a.id === activeAgentId);
  
  const handleSaveConfig = async () => {
    if (!activeAgent) return;
    
    setIsSaving(true);
    
    try {
      const success = await saveAgent(activeAgent);
      if (!success) {
        console.error("Falha ao salvar o agente");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateAgent = (updatedAgent: Agent) => {
    // Atualiza o agente no estado local
    setAgents(
      agents.map(agent => 
        agent.id === updatedAgent.id ? updatedAgent : agent
      )
    );
  };
  
  return (
    <MainLayout title="Painel Administrativo" subtitle="Configure agentes, personalize prompts e gerencie as configurações do sistema">
      <div className="space-y-6">
        <Button 
          variant="ghost" 
          className="w-fit flex items-center text-muted-foreground hover:text-foreground"
          onClick={() => navigate("/")}
        >
          <ArrowLeftCircle className="mr-2 h-4 w-4" />
          Voltar para o início
        </Button>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-lg">Carregando configurações...</span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {agents.map(agent => (
                <AgentCard
                  key={agent.id}
                  id={agent.id}
                  name={agent.name}
                  description={agent.description}
                  icon={agent.icon}
                  isActive={agent.active}
                  isSelected={agent.id === activeAgentId}
                  onClick={() => setActiveAgentId(agent.id)}
                />
              ))}
            </div>
            
            {activeAgent && (
              <AgentTabs
                agent={activeAgent}
                isSaving={isSaving}
                onSave={handleSaveConfig}
                onUpdateAgent={handleUpdateAgent}
              />
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default AdminDashboard;
