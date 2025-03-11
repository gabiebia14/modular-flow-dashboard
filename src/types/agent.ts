
import { LucideIcon } from "lucide-react";

export interface Agent {
  id: string;
  name: string;
  description: string;
  prompt: string;
  model: "gpt-4o" | "gpt-4o-mini" | "claude-3-haiku" | "claude-3-sonnet" | "gemini-pro";
  active: boolean;
  type: "atendimento" | "orcamento" | "validacao" | "email";
  icon?: LucideIcon;
}

export interface Quote {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  products: QuoteProduct[];
  location: string;
  deliveryDate?: string;
  paymentMethod?: string;
  status: "pending" | "processing" | "completed" | "approved" | "sent";
  totalValue?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuoteProduct {
  id: string;
  name: string;
  type: string;
  subtype?: string;
  dimension?: string;
  quantity: number;
  unitPrice?: number;
}

export interface Product {
  id: string;
  name: string;
  type: string;
  subtype?: string;
  dimension?: string;
  description?: string;
}
