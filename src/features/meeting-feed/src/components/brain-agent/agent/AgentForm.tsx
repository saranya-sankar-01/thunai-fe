import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, X, Save, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Agent } from "../pages/AgentConfig";
import {getLocalStorageItem ,requestApi } from "@/services/authService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { requestApi } from "@/service/MeetingService";

interface AgentFormProps {
  agent?: Agent;
  // Corrected: Omit 'created' and 'updated' instead of 'createdAt' and 'updatedAt'
  onSubmit: (agentData: Omit<Agent, "id" | "created" | "updated">) => void;
  onCancel: () => void;
}

const AgentForm = ({ agent, onSubmit, onCancel }: AgentFormProps) => {
  const { toast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState(agent?.name || "");
  const [description, setDescription] = useState(agent?.description || "");
  const [meeting_criteria, setMeeting_criteria] = useState(
    agent?.meeting_criteria ||
    "- Include meetings with strategic discussions\n- Include product planning sessions\n- Include technical architecture meetings\n- Exclude daily standups\n- Exclude 1-on-1 meetings"
  );
  const [content_template, setContent_template] = useState(
    agent?.content_template ||
    "## Meeting Summary\n{summary}\n\n## Key Topics\n{topics}\n\n## Action Items\n{action_items}\n\n## Decisions Made\n{decisions}\n\n## Participants\n{participants}"
  );
const [human_in_loop_enabled, setHuman_in_loop_enabled] = useState(
  agent?.approval_workflow?.human_in_loop_enabled ?? false
);

  // ✅ approvers as { email: user_id }
  const [approvers, setApprovers] = useState<Record<string, string>>(
    agent?.approval_workflow?.approvers || {}
  );

  const [newApprover, setNewApprover] = useState("");
  const userInfo = getLocalStorageItem("user_info") || {};
  const tenant_id = userInfo?.default_tenant_id || localStorage.getItem("tenant_id");

const addApprover = () => {
  if (!newApprover) return;

  const selectedUser = users.find(
    (user) => user.emailid === newApprover
  );

  if (!selectedUser?.user_id) return;

  setApprovers((prev) => ({
    ...prev,
    [selectedUser.emailid]: selectedUser.user_id, 
  }));

  setNewApprover("");
};


  const removeApprover = (email: string) => {
    const updated = { ...approvers };
    delete updated[email];
    setApprovers(updated);
  };

const handleSubmit = async () => {
  if (!name.trim()) {
    toast({
      title: "Error",
      description: "Agent name is required",
      variant: "destructive",
    });
    return;
  }

  setIsSaving(true);   // 🔥 Start loader

  try {
    await onSubmit({
      name,
      description,
      meeting_criteria,
      content_template,
      approval_workflow: {
        human_in_loop_enabled,
        approvers,
      },
    });

    // toast({
    //   title: agent ? "Agent Updated" : "Agent Created",
    //   description: agent
    //     ? "Agent configuration has been updated successfully."
    //     : "New agent has been created successfully.",
    // });

  } finally {
    setIsSaving(false);  // 🔥 Stop loader
  }
};

  const getUsers = async () => {
    try {
      const payload = {
        filter: [],
        page: {
          size: 1000,
          page_number: 1,
        },
        page_number: 1,
        size: 5,
        sort: 'dsc',
      };
      const response = await requestApi('POST', `${tenant_id}/users/`, payload, 'accountService');
      
        setUsers(response.data.data ||[]);
        // console.log("Success:", response.data.data);
    
    } catch (error) {
      console.error("Error creating reflect setup:", error);
      setUsers([]); 
      throw error;
    }
  }

  useEffect(() => {
    getUsers(); // Fetch users when the component mounts
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onCancel}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {agent ? "Edit Agent" : "Create New Agent"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {agent ? "Update agent configuration" : "Configure a new agent for your Brain"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Define the agent name and purpose</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Agent Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Strategic Meetings Agent"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what this agent does..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Agent Instructions</CardTitle>
              <CardDescription>
                Configure what meetings should be added to the Brain and how content should be formatted
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="meeting-criteria">Meeting Selection Criteria</Label>
                <Textarea
                  id="meeting-criteria"
                  placeholder="Define criteria for which meetings should be added to the Brain..."
                  value={meeting_criteria}
                  onChange={(e) => setMeeting_criteria(e.target.value)}
                  rows={8}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Specify rules for automatically selecting meetings to add to the Brain
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content-format">Content Format Template</Label>
                <Textarea
                  id="content-format"
                  placeholder="Define the format for content added to the Brain..."
                  value={content_template}
                  onChange={(e) => setContent_template(e.target.value)}
                  rows={10}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Use placeholders like {"{summary}"}, {"{topics}"}, {"{action_items}"} to structure the content
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Approval Workflow</CardTitle>
              <CardDescription>Configure human-in-the-loop approval process</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="human-in-loop">Enable Human-in-the-Loop</Label>
                  <p className="text-sm text-muted-foreground">
                    Require approval before adding content to the Brain
                  </p>
                </div>
                <Switch
                  id="human-in-loop"
                  checked={human_in_loop_enabled}
                  onCheckedChange={setHuman_in_loop_enabled}
                />
              </div>

              {human_in_loop_enabled && (
                <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-info mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Approval Required</p>
                      <p className="text-xs text-muted-foreground">
                        Content will be queued for approval before being added to the Brain
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="approvers">Approvers</Label>
                    <div className="flex gap-2">
                      {/* <Input
                        id="approvers"
                        placeholder="Enter email address"
                        value={newApprover}
                        onChange={(e) => setNewApprover(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addApprover();
                          }
                        }}
                      /> */}
                      <Select value={newApprover} onValueChange={setNewApprover}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select email address" />
                  </SelectTrigger>
                  <SelectContent>
                   {users.map((user: any) => (
  <SelectItem
    key={user.emailid}
    value={user.emailid}
    className="py-2 focus:bg-gray-50"
  >
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-black">{user.username}</span>
      <span className="text-xs text-muted-foreground">- {user.emailid}</span>
    </div>
  </SelectItem>
))}

                  </SelectContent>
                </Select>
                      <Button onClick={addApprover} size="icon" variant="secondary">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
<div className="flex flex-wrap gap-2 mt-3">
  {(Array.isArray(approvers) ? approvers : Object.keys(approvers || {})).map(
    (email) => (
      <Badge key={email} variant="secondary" className="gap-1 pr-1">
        {email}
        <button
          onClick={() => removeApprover(email)}
          className="ml-1 rounded-full hover:bg-background/50 p-0.5"
        >
          <X className="h-3 w-3" />
        </button>
      </Badge>
    )
  )}
</div>

                 {Object.keys(approvers).length === 0 && (
                      <p className="text-xs text-muted-foreground">
                        No approvers added yet. Add email addresses of users who can approve content.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
           <Button onClick={handleSubmit} size="lg" className="gap-2" disabled={isSaving}>
  {isSaving ? (
    <Loader2 className="h-4 w-4 animate-spin" />
  ) : (
    <Save className="h-4 w-4" />
  )}

  {isSaving
    ? agent 
      ? "Updating..." 
      : "Creating..."
    : agent 
      ? "Update Agent" 
      : "Create Agent"}
</Button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentForm;
