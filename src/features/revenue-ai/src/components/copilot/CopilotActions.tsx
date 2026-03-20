import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Message } from "../../pages/Copilot";
import { Lightbulb } from "lucide-react";

type CopilotActionsProps = {
  message: Message;
};

export const CopilotActions = ({ message }: CopilotActionsProps) => {
  if (!message.actions || message.actions.length === 0) return null;

  return (
    <div className="border-t border-border p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Lightbulb className="h-5 w-5 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Recommended Actions</h3>
      </div>

      <div className="space-y-2">
        {message.actions.map((action) => (
          <div key={action.id} className="space-y-1">
            <Button
              variant="outline"
              className="w-full justify-between h-auto py-3"
            >
              <span className="text-left">{action.label}</span>
              {action.impact === "high" && (
                <Badge variant="destructive" className="ml-2">
                  High impact
                </Badge>
              )}
              {action.impact === "medium" && (
                <Badge variant="secondary" className="ml-2">
                  Medium
                </Badge>
              )}
            </Button>
            {action.description && (
              <p className="text-xs text-muted-foreground px-2">
                {action.description}
              </p>
            )}
          </div>
        ))}
      </div>

      <Separator />

      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">One-Click Ops</p>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" size="sm">Draft follow-up</Button>
          <Button variant="ghost" size="sm">Create CRM task</Button>
          <Button variant="ghost" size="sm">Update stage</Button>
          <Button variant="ghost" size="sm">Export XLS</Button>
        </div>
      </div>
    </div>
  );
};
