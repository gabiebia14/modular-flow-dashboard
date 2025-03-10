
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
