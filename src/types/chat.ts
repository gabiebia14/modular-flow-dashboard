
export interface Message {
  id: string;
  content: string;
  sender: "user" | "agent";
  timestamp: Date;
}

export interface ChatInterfaceProps {
  welcomeMessage?: string;
  placeholder?: string;
}
