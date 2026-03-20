import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Phone, Mail, Database } from "lucide-react";

type Evidence = {
  id: string;
  type: "call" | "email" | "crm";
  title: string;
  timestamp: string;
  content: string;
};

export const EvidenceCard = ({ evidence }: { evidence: Evidence }) => {
  const getIcon = () => {
    switch (evidence.type) {
      case "call":
        return <Phone className="h-4 w-4" />;
      case "email":
        return <Mail className="h-4 w-4" />;
      case "crm":
        return <Database className="h-4 w-4" />;
    }
  };

  const getTypeBadge = () => {
    const variants: Record<Evidence["type"], string> = {
      call: "default",
      email: "secondary",
      crm: "outline",
    };
    return (
      <Badge variant={variants[evidence.type] as any} className="gap-1">
        {getIcon()}
        {evidence.type}
      </Badge>
    );
  };

  return (
    <Card className="p-3 space-y-2 hover:bg-muted/50 transition-colors cursor-pointer">
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-medium text-foreground">{evidence.title}</h4>
        {getTypeBadge()}
      </div>
      <p className="text-xs text-muted-foreground">{evidence.timestamp}</p>
      <p className="text-sm text-foreground line-clamp-2">{evidence.content}</p>
    </Card>
  );
};
