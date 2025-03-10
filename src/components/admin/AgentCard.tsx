
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui-custom/Card";
import { LucideIcon } from "lucide-react";

interface AgentCardProps {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  isActive: boolean;
  isSelected: boolean;
  onClick: () => void;
}

export const AgentCard = ({
  id,
  name,
  description,
  icon: Icon,
  isActive,
  isSelected,
  onClick,
}: AgentCardProps) => {
  return (
    <Card
      key={id}
      className={`cursor-pointer ${isSelected ? "border-primary" : "border-border"}`}
      onClick={onClick}
      hover="true"
    >
      <CardHeader>
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <CardTitle>{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  );
};
