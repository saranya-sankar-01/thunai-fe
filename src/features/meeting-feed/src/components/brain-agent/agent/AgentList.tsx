import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Users, FileText, CheckCircle, XCircle, Loader2 } from "lucide-react";
import type { Agent } from "../pages/AgentConfig";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import ISTTime from "@/components/shared-components/ISTTime";
import { useState } from "react";

interface AgentListProps {
  agents: Agent[];
  onEdit: (agent: Agent) => void;
  onDelete: (id: string) => void;
}

const AgentList = ({ agents, onEdit, onDelete }: AgentListProps) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);
const handleDelete = async (id: string) => {
  try {
    setDeletingId(id); 
    await onDelete(id); 
  } finally {
    setDeletingId(null); 
  }
};
  return (
    <div className="grid gap-6">
      {agents.map((agent) => (
        <Card key={agent.id} className="border-2 hover:border-primary/30 transition-all">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-xl mb-2">{agent.name}</CardTitle>
                <CardDescription>{agent.description}</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onEdit(agent)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Agent</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{agent?.name}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                       onClick={() => handleDelete(agent.id || "")}
                        disabled={deletingId === agent.id}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                       {deletingId === agent.id ? (
    <Loader2 className="h-4 w-4 animate-spin" />
  ) : (
   "Delete"
  )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <FileText className="h-4 w-4 text-primary" />
                  Meeting Criteria
                </div>
                <div className="text-xs text-muted-foreground bg-muted/30 rounded p-3 font-mono">
  {(agent.meeting_criteria || "")
    .split("\n")
    .slice(0, 3)
    .join("\n")}

  {(agent.meeting_criteria || "").split("\n").length > 3 && "\n..."}
</div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  {agent?.approval_workflow?.human_in_loop_enabled ? (
                    <CheckCircle className="h-4 w-4 text-success" />
                  ) : (
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                  )}
                  Approval Workflow
                </div>
                <div className="space-y-2">
                  <Badge variant={agent?.approval_workflow?.human_in_loop_enabled ? "default" : "secondary"}>
                    {agent.approval_workflow?.human_in_loop_enabled ? "Human-in-the-Loop Enabled" : "Auto-Approve"}
                  </Badge>
                 {agent?.approval_workflow?.human_in_loop_enabled && (
  (() => {
    const approvers = agent?.approval_workflow?.approvers;
    const approverCount = Array.isArray(approvers)
      ? approvers.length
      : approvers
      ? Object.keys(approvers).length
      : 0;

    return approverCount > 0 ? (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Users className="h-3 w-3" />
        {approverCount} approver{approverCount !== 1 ? "s" : ""}
      </div>
    ) : null;
  })()
)}

                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border">
              <span>Created: <ISTTime utcString={agent?.created ?? ""}/></span>
              <span>•</span>
              <span>Last updated: <ISTTime utcString={agent?.updated ?? ""}/></span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AgentList;
