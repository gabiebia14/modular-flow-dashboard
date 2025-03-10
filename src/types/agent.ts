
import { LucideIcon } from "lucide-react";

export interface Agent {
  id: string;
  name: string;
  description: string;
  prompt: string;
  model: "gpt-4o" | "gpt-4o-mini" | "claude-3-haiku" | "claude-3-sonnet";
  active: boolean;
  type: "atendimento" | "orcamento" | "validacao" | "email";
  icon?: LucideIcon;
}

export interface AgentDB {
  id: string;         // UUID do banco de dados
  agent_id: string;   // ID do agente (ex: "atendimento")
  name: string;
  description: string;
  prompt: string;
  model: string;
  active: boolean;
  type: string;
  created_at: string;
  updated_at: string;
}

export interface ApiKey {
  id: string;
  provider: string;
  api_key: string;
  endpoint?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}
