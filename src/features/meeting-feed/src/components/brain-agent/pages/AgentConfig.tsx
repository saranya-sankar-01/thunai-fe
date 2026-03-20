import { useState,useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AgentList from "../agent/AgentList";
import AgentForm from "../agent/AgentForm";
import {getLocalStorageItem, requestApi } from "../../../Service/MeetingService";
import { useToast } from "@/hooks/use-toast";

export interface Agent {
 id?: string;
  tenant_id?: string;
  user_id?: string;
  name: string;
  description: string;
  meeting_criteria: string;
  content_template: string;

  approval_workflow: {
    human_in_loop_enabled: boolean;
    approvers: Record<string, string>;
  };

  status?: string;
  created?: string;
  updated?: string;
}

const AgentConfig = () => {
  const navigate = useNavigate();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userInfo = getLocalStorageItem("user_info") || {};
    const tenantId = userInfo?.default_tenant_id || localStorage.getItem("tenant_id");
  const { toast } = useToast();

 const fetchAgents = async () => {
      try {
        const response = await requestApi("GET",`brain/meeting-agents/${tenantId}/`,null,'brainService'); // Replace with your actual API endpoin
        setAgents(response.data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };
  useEffect(() => {
    fetchAgents();
  }, []);

  const handleCreateAgent = async (
    data: Omit<Agent, "id" | "created" | "updated">
  ) => {
    try {
      const response = await requestApi(
        "POST",
        `brain/meeting-agents/${tenantId}/`,
        data,
        "brainService"
      );
    fetchAgents();
      toast({
        description: response.message || "Brain meeting agent created successfully"
      }); 
      setIsCreating(false);
    } catch (err) {
      console.error("Create failed", err);
      const errorMessage =
        (err as any)?.response?.message || "Save failed";
      toast({
        description: errorMessage
      }); 
    }
  };

  const handleUpdateAgent = async (
    data: Omit<Agent, "id" | "created" | "updated">
  ) => {
    if (!editingAgent?.id) return;

    try {
      const response = await requestApi(
        "PUT",
        `brain/meeting-agents/${tenantId}/${editingAgent.id}/`,
        data,
        "brainService"
      );
      
    fetchAgents();
      toast({
        description: response?.message || "Brain meeting agent updated successfully"
      }); 
      setEditingAgent(null);
    } catch (err:any) {
      console.error("Update failed", err);
        toast({
      description: 
      err.response.message || "Update failed"
    }); 
    }
  };

  const handleDeleteAgent = async (id: string) => {
    try {
   const response = await requestApi(
        "DELETE",
        `brain/meeting-agents/${tenantId}/${id}/`,
        null,
        "brainService"
      );
      fetchAgents()
      toast({
      description: 
      response?.message || "Deleted successfully"
    });
    } catch (err:any) {
      console.error("Delete failed", err);
     toast({
      description: 
      err?.response?.message || "Delete failed"
    });  
    }
  };

  if (error) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-destructive">Error: {error}</div>;
  }

  if (isCreating) {
    return (
      <AgentForm
        onSubmit={handleCreateAgent}
        onCancel={() => setIsCreating(false)}
      />
    );
  }

  if (editingAgent) {
    return (
      <AgentForm
        agent={editingAgent}
        onSubmit={handleUpdateAgent}
        onCancel={() => setEditingAgent(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate("/meeting-feed/agent")}
                className="rounded-full"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Agent Configuration</h1>
                <p className="text-sm text-muted-foreground">Manage your Brain agents and their rules</p>
              </div>
            </div>
            <Button onClick={() => setIsCreating(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Agent
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8 px-4">
        {isLoading && (
    <div className="w-full py-10 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin h-8 w-8 rounded-full border-4 border-gray-300 border-t-transparent"></div>
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  )}
  {!isLoading && (
    <>
        {agents.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Agents Configured</CardTitle>
              <CardDescription>Create your first agent to start managing meeting content</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setIsCreating(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Your First Agent
              </Button>
            </CardContent>
          </Card>
        ) : (
          <AgentList
            agents={agents}
            onEdit={setEditingAgent}
            onDelete={handleDeleteAgent}
          />
        )}
        </>)}
      </div>
    </div>
  );
};

export default AgentConfig;
