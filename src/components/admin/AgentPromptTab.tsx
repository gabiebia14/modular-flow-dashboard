
import { AgentConfig } from "@/components/ui-custom/AgentConfig";

interface AgentPromptTabProps {
  agentName: string;
  prompt: string;
}

export const AgentPromptTab = ({ agentName, prompt }: AgentPromptTabProps) => {
  return <AgentConfig agentName={agentName} defaultPrompt={prompt} />;
};
