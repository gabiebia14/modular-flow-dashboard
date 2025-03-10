
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui-custom/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Loader2 } from "lucide-react";
import { AgentPromptTab } from "./AgentPromptTab";
import { AgentModelTab } from "./AgentModelTab";
import { AgentApiTab } from "./AgentApiTab";
import { Agent } from "@/types/agent";

interface AgentTabsProps {
  agent: Agent | undefined;
  isSaving: boolean;
  onSave: () => void;
  onUpdateAgent: (updatedAgent: Agent) => void;
}

export const AgentTabs = ({ agent, isSaving, onSave, onUpdateAgent }: AgentTabsProps) => {
  if (!agent) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Configuração do Agente</CardTitle>
            <CardDescription>
              Personalize o comportamento do agente {agent.name.toLowerCase()}
            </CardDescription>
          </div>
          <Button onClick={onSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Salvar Configurações
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="prompts">
          <TabsList className="mb-4">
            <TabsTrigger value="prompts">Prompts</TabsTrigger>
            <TabsTrigger value="model">Modelo LLM</TabsTrigger>
            <TabsTrigger value="api">Configurações de API</TabsTrigger>
          </TabsList>
          
          <TabsContent value="prompts">
            <AgentPromptTab agent={agent} onUpdate={onUpdateAgent} />
          </TabsContent>
          
          <TabsContent value="model">
            <AgentModelTab agent={agent} onUpdate={onUpdateAgent} />
          </TabsContent>
          
          <TabsContent value="api">
            <AgentApiTab />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
