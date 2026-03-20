import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Bot, Play, Pause, Settings, Trash2, Copy, MoreVertical, Calendar, MessageCircle, Search, Filter, Plus, Phone, Mic, Loader2,RefreshCw, Ban  } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useState,useEffect,useCallback  } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWidgetData ,deleteAgent,fetchAgentsFilter,saveAgent} from "../services/authService";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { AgentPagination } from "@/components/ui/agent-pagination"; // Adjust this path if needed
import { debounce } from "lodash"; 
import { CreateAgentDialog } from "../components/CreateAgentDialogProps ";
import { useLocation } from "react-router-dom";
import { useWidgetStore } from '../stores/widgetStore';
import { CanvasDialog } from "../components/canvas-template/CanvasDialog";
import { DeleteConfirmationDialog } from "../components/shared-components/DeleteConfirmationDiolog";
interface Agent {
  id: string;
  name: string;
  description?: string;
  status: "active" | "paused" | "deactivated";
  lastModified: string;
  conversationsCount: number;
  successRate: number;
  avatar?: string;
  tags: string[];
  interfaces: string[];
  agent_type: string | null;
  active: boolean;
  paused: boolean;
  created: string;
  updated: string;
  widget_id: string;
}

const MyAgents = () => {
   const { setWidgetId } = useWidgetStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();
  const location = useLocation()
    const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
   const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();
  const [pausingAgentId, setPausingAgentId] = useState<string | null>(null);
const [activatingAgentId, setActivatingAgentId] = useState<string | null>(null);
const [deletingAgentId, setDeletingAgentId] = useState<string | null>(null);
const [deactivateAgentId, setDeactivateAgentId] = useState<string | null>(null);
const [duplicatingAgentId, setDuplicatingAgentId] = useState<string | null>(null);

const [configuringAgentId, setConfiguringAgentId] = useState<string | null>(null);
 const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [agentName, setAgentName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [apiStats, setApiStats] = useState({
    total: 0,
    total_active: 0,
    total_conversations:0
  });
   const [isFilterLoading, setIsFilterLoading] = useState(false);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [isPaginationLoading, setIsPaginationLoading] = useState(false);

const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
const [agentToDelete, setAgentToDelete] = useState<Agent | null>(null);
  useEffect(() => {
    fetchAgents(currentPage);
    // setLoading(false)
  }, []);

const getFilterPayload = (currentStatusFilter: string,searchQuery: string = "") => {
  const filter = [];
  if (searchQuery.trim()) {
    filter.push({
      key_name: "name",
      operator: "like",
      key_value: searchQuery.trim()
    });
  }
  if (currentStatusFilter === "active") {
    filter.push({
      key_name: "active",
      key_value: true,
      operator: "="
    });
  } else if (currentStatusFilter === "paused") {
    filter.push({
      key_name: "paused",
      key_value: true,
      operator: "="
    });
  } else if (currentStatusFilter === "deactivated") {
    filter.push({
      key_name: "active",
      key_value: false,
      operator: "="
    });
  }
  
  return filter;
};
const handleRefresh = async () => {
  try {
    setIsRefreshing(true);
    setIsSearchLoading(true);

    await fetchAgents(currentPage, statusFilter, searchQuery);
  } catch (error) {
    handleError(error, "Failed to refresh agents");
  } finally {
    setIsRefreshing(false);
    setIsSearchLoading(false)
  }
};

const handleError = (error: any, fallbackMessage: string) => {
  console.error(fallbackMessage, error);
  toast({
    title: "Error",
    description: error.response?.data?.message || fallbackMessage,
    variant: "destructive",
  });
};
const transformAgent = (apiAgent: any): Agent => ({
  id: apiAgent.id,
  name: apiAgent.name,
  description: apiAgent.description || "No description provided",
  status: !apiAgent.active
    ? "deactivated"
    : apiAgent.paused
    ? "paused"
    : "active",
  lastModified: new Date(apiAgent.updated).toLocaleDateString("en-CA"),
  conversationsCount: apiAgent.conversation_count,
  successRate: 0,
  tags: [apiAgent.agent_type || "general"].filter(Boolean),
  interfaces: apiAgent.interface || [],
  agent_type: apiAgent.agent_type,
  active: apiAgent.active,
  paused: apiAgent.paused,
  created: apiAgent.created,
  updated: apiAgent.updated,
  widget_id: apiAgent.widget_id,
});

 const refreshAgents = async (page = currentPage, filterValue = statusFilter,searchValue = searchQuery, operationType?: 'filter' | 'search' | 'pagination') => {

    if (operationType === 'filter') setIsFilterLoading(true);
    if (operationType === 'search') setIsSearchLoading(true);
    if (operationType === 'pagination') setIsPaginationLoading(true);

    try {
      const filter = getFilterPayload(filterValue,searchValue);
      const filterOptions = {
        page: { size: 10, page_number: page },
        filter,
      };

      const data = await fetchAgentsFilter(filterOptions);
      if (data.status === "success") {
        setAgents(data.data.data.map(transformAgent));
        setTotalPages(Math.ceil(data.data.total / 10));
        setApiStats({ total: data.total, total_active: data.total_active,total_conversations:data.total_conversations });
      }
    } catch (error) {
      handleError(error, "Failed to fetch agents");
    } finally {
      // Clear appropriate loading state
      if (operationType === 'filter') setIsFilterLoading(false);
      if (operationType === 'search') setIsSearchLoading(false);
      if (operationType === 'pagination') setIsPaginationLoading(false);
    }
  };
const handleConfigure = async (agent: Agent) => {
  try {
    setConfiguringAgentId(agent.id);
     setWidgetId(agent.widget_id);
    const response = await fetchWidgetData(agent.id);
    
    if (response.status === 'success') {
      const agentData = {
        agentName: response.data.agent_name || agent.name,
        agentInstructions: response.data.agent_instructions || '',
   agentType:response.data.agent_type || '',
   agentDescription:response.data.description||'',
        fields:response.data.fields||'',
        interfaces: {
          voice: {
            enabled: response.data.interface?.includes('voice') || false,
            enableScreenShare: response.data.enable_share_screen || false,
            storeConversationAudio: response.data.store_conversation_audio || false,
            selectedVoice: response.data.agent_voice_id || '',
            enableDurationLimit:response.data.voice?.enable_duration || false,
            selectedLanguage:response.data.agent_language || '',
            agentDuration:response.data.voice?.agent_duration || '',
            process_transcript:response.data.process_transcript || false,
            sentiment_suggestion:response.data.sentiment_suggestion || false,
          },
          email: {
            enabled: response.data.interface?.includes('email') || false,
            customEmail: response.data.email?.custom_from_email || "",
            signature:response.data.email?.signature|| "",
            prefered_mail:response.data.email?.prefered_mail || "",
            ignoreDomains:response.data.email?.ignored_domains|| [],
            reply_email:response.data.email?.reply_email || false,
            agent_provider: response.data.email?.agent_provider || "thunai",
            agent_application_id: response.data.email?.agent_application_id || "",
            mail_box_email: response.data.email?.mail_box_email || "",
          },
          chatbox: {
            enabled: response.data.interface?.includes('chatbox') || false,
            enable_file_upload:response.data?.enable_file_upload || false,
            trademark:response.data?.widget_template.trademark || false,
            bubbleShape: response.data?.widget_template?.bubbleShape || "round",
            faqs:response.data?.faqs || [],
            process_transcript:response?.data?.widget_template?.process_transcript || false,

          },
          meeting_agent:{
            enabled: response.data.interface?.includes('meeting_agent') || false,
            meeting_apply:response.data?.meeting_apply|| "",
            multi_select_users:response.data?.multi_select_users || []
          }
        },
        tools: {
          brain: response.data.tools?.includes('brain') || false,
          analytics: response.data.tools?.includes('analytics') || false,
          canvas: response.data.tools?.includes('canvas') || false,
          mcp: response.data.tools?.includes('mcp') || false,
          web_search: response.data.tools?.includes('web_search') || false,
        },
        info_not_talk_about:response.data.info_not_talk_about || "",
         access_control: response.data.access_control ? {
          enableAccessControl: response.data.access_control.enableAccessControl || false,
          auth_type: response.data.access_control.auth_type || "",
      app_id:response.data.access_control.app_id || "",

          // directory_id: response.data.access_control.directory_id || "",
          access_rules: response.data.access_control.access_rules || [
            {
              attribute: "",
              operator: "",
              value: "",
              ai_instruction: ""
            }
          ]
        }:"",
        widget_id:response.data?.widget_id,
        html:response.data.voice?.html,
        custom_auth_flow:response.data.custom_auth_flow || false,
        custom_auth_endpoints:{
          refresh_token_endpoint:response.data.custom_auth_endpoints?.refresh_token_endpoint|| ""
        },
       widget: {
  theme: response.data.widget_template?.theme || "light",
  border_radius: response.data.widget_template?.border_radius || "8",
  widget_position: response.data.widget_template?.widget_position || "right", 
  intial_message: response.data.intial_message || "", // Add this
  agentName: response.data.agent_name || agent.name, // Add this
  display_type: response.data.widget_template?.display_type || "all",
  is_reasoning: response.data.widget_template?.is_reasoning || false,
show_beacon: response.data.widget_template?.show_beacon ?? false,
  primary_color: response.data.widget_template?.primary_color || "#3B82F6",
  secondary_color: response.data.widget_template?.secondary_color || "#DEDEDE",
  tertiary_color: response.data.widget_template?.tertiary_color || "#000000",
  widget_bg_color: response.data.widget_template?.widget_bg_color || "#FFFFFF",
  selectedIconUrl : response.data.widget_template?.icon || "",
  widget_text : response.data.widget_template?.widget_text || "",
  logo:response.data.widget_template?.logo || "",
  user_text:response.data.widget_template?.user_text,
  bot_text:response.data.widget_template?.bot_text,
  
},

  canTestAgent: response.data.interface?.includes('voice') || response.data.interface?.includes('chatbox'),
// emailPrefixSaved: !!(response.data.email?.prefered_mail),  
 throttling_settings: {
          enabled: response.data.throttling_settings?.enabled || false,
          max_user_block_time: response.data.throttling_settings?.max_user_block_time || null,
          max_websocket_request_seconds: response.data.throttling_settings?.max_websocket_request_seconds || null,
          max_count_per_seconds: response.data.throttling_settings?.max_count_per_seconds || null,
          websocket_rate_limit_window: response.data.throttling_settings?.websocket_rate_limit_window || null,
          max_websocket_requests_per_window: response.data.throttling_settings?.max_websocket_requests_per_window || null,
        },    
};

      // Navigate with the prepopulated data
      navigate(`${agent.id}/edit`, { 
        state: { prepopulatedData: agentData } 
      });
    }
  } catch (error) {
    console.error('Error fetching widget data:', error);
    // Navigate without prepopulated data on error
    navigate(`${agent.id}/edit`);
  }
  finally {
    setConfiguringAgentId(null);
  }
};
const handleTogglePause = async (agent: Agent) => {
  try {
     setPausingAgentId(agent.id);
    const newPausedValue = !agent.paused;
    await saveAgent({ id: agent.id, paused: newPausedValue }, agent.id,"PATCH");
  await refreshAgents();
    
    toast({
      title: `Agent ${newPausedValue ? "Paused" : "Started"}`,
      description: `"${agent.name}" is now ${newPausedValue ? "paused" : "active"}.`,
    });
  } catch (error: any) {
     handleError(error, "Failed to update agent status.");
  } finally {
    setPausingAgentId(null);
  }
};

const handleActivateAgent = async (agent: Agent) => {
  try {
     setActivatingAgentId(agent.id);
    await saveAgent({ id: agent.id, active: true }, agent.id,"PATCH");
    await refreshAgents();

    toast({
      title: "Agent Activated",
      description: `"${agent.name}" is now active.`,
    });
  } catch (error: any) {
    handleError(error, "Failed to update agent status.");
  } finally {
     setActivatingAgentId(null);
  }
};

const handleDeactivateAgent = async (agent: Agent) => {
  try {
     setDeactivateAgentId(agent.id);
    await saveAgent({ id: agent.id, active: false }, agent.id,"PATCH");
    await refreshAgents();

    toast({
      title: "Agent Deactivated",
      description: `"${agent.name}" is now Deactivated.`,
    });
  } catch (error: any) {
    handleError(error, "Failed to update agent status.");
  } finally {
    setDeactivateAgentId (null);
  }
};

const handleDuplicateAgent = async (agent: Agent) => {
  try {
    setDuplicatingAgentId(agent.id); // Add this state variable
    
    const duplicatePayload = {
      widget_id: agent.widget_id,
    };

    const response = await saveAgent(duplicatePayload, undefined, "PUT");
      await refreshAgents();
    
    if (response?.status === "success") {
      toast({
        title: "Agent Duplicated",
        description: `"${agent.name}" has been duplicated successfully.`,
      });
    }
  } catch (error: any) {
    handleError(error, "Failed to duplicate agent. Please try again.");
  } finally {
    setDuplicatingAgentId(null);
  }
};

const debouncedSearch = useCallback(
  debounce(async (searchValue: string) => {
    await fetchAgents(1, statusFilter, searchValue, 'search');
  }, 1000),
  [statusFilter]
);
 const fetchAgents = async (page:number,filterValue = statusFilter,searchValue = searchQuery, operationType?: 'filter' | 'search' | 'pagination') => {
    try {
      // setLoading(true);
      //  if(isSearchLoading) setLoading(true)
      //  if (!operationType) setLoading(true);
    await refreshAgents(page, filterValue,searchValue, operationType);
    } catch (error) {
     handleError(error, "Failed to fetch agents. Please try again.");
    } finally {
      setLoading(false);
      setIsSearchLoading(false)
    }
  };
const handleCreateAgent = async () => {
  if (!agentName.trim()) {
    toast({
      title: "Agent Name Required",
      description: "Please enter a name for your agent.",
      variant: "destructive",
    });
    return;
  }
  try {
    setIsCreating(true);
    const payload = {
      name: agentName.trim(),
      agent_name: "",
      agent_instructions: "",
      description: "",
      interface: [], // No interfaces enabled initially
      tools: ["mcp","brain"], // No tools enabled initially
      primary_color: "",
      widget_position: "",
      widget_bg_color: "",
      widget_text: "",
      // fields: {
      //   defaultItems: [],
      //   customItems: []
      // },
      enable_share_screen: false,
      store_conversation_audio: false,
      info_not_talk_about: "",
      agent_voice_id: "",
      agent_language: "",
      widget_template: {
        is_reasoning:true
      },
      access_control: {},
     workflow_type:""

    };

    const response = await saveAgent(payload,undefined,"POST");
    
    if ( response?.data?.id && response?.data?.widget_id) {
      setWidgetId(response.data.widget_id);
      toast({
        title: "Agent Created",
        description: `"${agentName}" has been created successfully.`,
      });

      setAgentName("");
      setIsCreateDialogOpen(false);

      navigate('create-agent', { 
        state: { 
          prepopulatedData: {
            id:response.data.id || "",
            agentName: response.data.name || agentName.trim(),
            agentDescription: response.data.description || "",
            agentInstructions: response.data.agent_instructions || "",
            info_not_talk_about: response.data.info_not_talk_about || "",
            custom_auth_flow: response.data.custom_auth_flow || false,
            fields: response.data.fields || { defaultItems: [], customItems: [] },
            tools: {
              brain: response.data.tools?.includes('brain') || false,
              analytics: response.data.tools?.includes('analytics') || false,
              canvas: response.data.enable_canvas || false,
              mcp: response.data.tools?.includes('mcp') || false,
            },
            agentType: response.data.agent_type || undefined,
            interfaces: {
              voice: {
                enabled: response.data.interface?.includes('voice') || false,
                selectedVoice: response.data.agent_voice_id || "",
                selectedLanguage: response.data.agent_language ? response.data.agent_language.split(',') : [],
                enableScreenShare: response.data.enable_share_screen || false,
                storeConversationAudio: response.data.store_conversation_audio || false,
                agentDuration: response.data.agent_duration || "",
                enableDurationLimit: response.data.enable_duration || false,
              },
              chatbox: {
                enabled: response.data.interface?.includes('chat') || false,
                enableInPortal: false,
                bubbleShape: "round",
                persistHistory: false,
                typingDelay: "medium",
              },
              email: {
                enabled: response.data.interface?.includes('email') || false,
                mailbox: response.data.email?.prefered_mail || "",
                fromName: "",
                signature: response.data.email?.signature || "",
                customEmail: response.data.email?.custom_from_email || "",
                ignoreDomains: response.data.email?.ignored_domains || []
              },
              meeting_agent: {
                enabled: response.data.interface?.includes('meeting') || false,
                applyTo: "",
              },
            },
            conversations: {},
            widget: {
              theme: response.data.widget_template?.theme || "light",
              borderRadius: response.data.widget_template?.borderRadius || "8",
              position: response.data.widget_position || "right",
              welcomeMessage: response.data.widget_text || "Hi! How can I help you today?",
              agentName: response.data.agent_name || agentName.trim(),
              show_beacon: response.data.wiget_template?.show_beacon ?? false,
              is_reasoning: response.data.widget_template?.is_reasoning || false,
            },
            access_control: response.data.access_control || {
              // directory_id: "",
              enableAccessControl: false,
              auth_type: "",
              access_rules: [{
                attribute: "",
                operator: "",
                value: "",
                ai_instruction: ""
              }]
            },
            widget_id: response.data.widget_id,
            html: ""
          }
        } 
      });
    } else {
      throw new Error("Invalid response structure - missing required data");
    }
  } catch (error: any) {
    console.error("Create agent failed:", error);
    toast({
      title: "Creation Failed",
      description: error.message || "Failed to create agent. Please try again.",
      variant: "destructive",
    });
  } finally {
    setIsCreating(false);
  }
};
const handleDeleteClick = (agent: Agent) => {
  setAgentToDelete(agent);
  setIsDeleteDialogOpen(true);
};
const handleConfirmDelete = async () => {
  if (!agentToDelete) return;
    try {
     setDeletingAgentId(agentToDelete.id);
    await deleteAgent(agentToDelete.id);
      // await fetchAgents(currentPage);
      await refreshAgents()
      toast({
        title: "Agent Deleted",
        description: `"${agentToDelete.name}" has been deleted successfully.`,
      });
    } catch (error) {
      console.error("Delete failed:", error);
     handleError(error, "Failed to delete agent. Please try again.");
    }
    finally {
    setDeletingAgentId(null);
     setIsDeleteDialogOpen(false);
    setAgentToDelete(null);
  }
  };

  const handleStatusFilterChange = async (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
    await fetchAgents(1,value,searchQuery, 'filter');
  };

  const handleSearchChange = async (value: string) => {
    setSearchQuery(value);
     setCurrentPage(1);
      debouncedSearch(value);

    // await fetchAgents(currentPage,statusFilter,value, 'search');
  };
 const handlePageChange = async (page: number) => {
    setCurrentPage(page);
    await fetchAgents(page,statusFilter, searchQuery,'pagination');
  };

  const getStatusBadge = (status: string) => {
    const config = {
      active: { label: "Active", className: "bg-thunai-positive/10 text-thunai-positive border-thunai-positive text-[11px]" },
      paused: { label: "Paused", className: "bg-thunai-warning/10 text-thunai-warning border-thunai-warning text-[11px]" },
      deactivated: { label: "Deactivated", className: "bg-thunai-text-secondary/10 text-thunai-text-secondary border-thunai-text-secondary text-[11px]" }
    };
    
    const statusConfig = config[status as keyof typeof config];
    return (
      <Badge className={statusConfig.className}>
        {statusConfig.label}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <Play className="h-4 w-4 text-thunai-positive" />;
      case "paused": return <Pause className="h-4 w-4 text-thunai-warning" />;
      default: return <Bot className="h-4 w-4 text-thunai-text-secondary" />;
    }
  };

  const getInterfaceIcon = (interfaceType: string) => {
    switch (interfaceType) {
      case "chat": return <MessageCircle className="h-3 w-3" />;
      case "voice": return <Mic className="h-3 w-3" />;
      case "meetings": return <Phone className="h-3 w-3" />;
      default: return <Bot className="h-3 w-3" />;
    }
  };
const filteredAgents =agents;

  // const avgSuccessRate = agents.length > 0 ? 
  //   (agents.reduce((sum, agent) => sum + agent.successRate, 0) / agents.length) : 0;
  const avgSuccessRate = 100

  // if (loading) {
  //   return (
  //     <div className="min-h-screen bg-background flex items-center justify-center">
  //       <div className="text-center">
  //         <Bot className="h-8 w-8 animate-spin mx-auto mb-4 text-thunai-primary" />
  //         <p className="text-thunai-text-secondary">Loading agents...</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-background flex flex-col ">
      <div className="container mx-auto px-3 py-8 flex-1">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
           <div>
  <div className="flex items-center gap-2 mb-1">
    <div className="w-1 h-6 bg-blue-600 rounded"></div>
    <h1 className="text-3xl font-bold text-thunai-text-primary">My Agents</h1>
  </div>
  <p className="text-thunai-text-secondary">
    Manage and monitor your AI agents
  </p>
</div>

<div className="flex space-x-2"> 
<CanvasDialog />
             
           <CreateAgentDialog
  isOpen={isCreateDialogOpen}
  setIsOpen={setIsCreateDialogOpen}
  agentName={agentName}
  setAgentName={setAgentName}
  isCreating={isCreating}
  handleCreateAgent={handleCreateAgent}
  triggerText="Create New Agent"
/>

</div>
          </div>
<div className="sticky top-0 z-20 bg-background p-4 ">
          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4 pb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-thunai-text-secondary" />
              <Input
                placeholder="Search agents by name, description..."
                value={searchQuery}
                // onChange={(e) => setSearchQuery(e.target.value)}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
              <SelectTrigger className="w-40">
                 {isFilterLoading ? (
      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
    ) : (
      <Filter className="h-4 w-4 mr-2" />
    )}
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="deactivated">Deactivated</SelectItem>
              </SelectContent>
            </Select>
             <Button
    variant="outline"
    onClick={handleRefresh}
    disabled={isRefreshing}
    className="flex items-center gap-2"
  >
    <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
    Refresh
  </Button>
          </div>
          {/* Agent Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="shadow-soft">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-thunai-positive/10 rounded-lg">
                    <Bot className="h-5 w-5 text-thunai-positive" />
                  </div>
                  <div>
                    <p className="text-sm text-thunai-text-secondary">Total Agents</p>
                    <p className="text-2xl font-bold text-thunai-text-primary">{apiStats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-soft">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-thunai-accent/10 rounded-lg">
                    <Play className="h-5 w-5 text-thunai-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-thunai-text-secondary">Active</p>
                    <p className="text-2xl font-bold text-thunai-text-primary">
                      {/* {agents.filter(a => a.status === "active").length} */}
                       {apiStats.total_active}
</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-soft">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-thunai-secondary/10 rounded-lg">
                    <MessageCircle className="h-5 w-5 text-thunai-secondary" />
                  </div>
                  <div>
                    <p className="text-sm text-thunai-text-secondary">Total Conversations</p>
                    <p className="text-2xl font-bold text-thunai-text-primary">
                      {apiStats.total_conversations}
                    
</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-soft">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-thunai-warning/10 rounded-lg">
                    <Bot className="h-5 w-5 text-thunai-warning" />
                  </div>
                  <div>
                    <p className="text-sm text-thunai-text-secondary">Avg Success Rate</p>
                    <p className="text-2xl font-bold text-thunai-text-primary">
                      {/* {(agents.reduce((sum, agent) => sum + agent.successRate, 0) / agents.length).toFixed(1)}% */}
                     {/* {avgSuccessRate.toFixed(1)}% */}
                     {avgSuccessRate}%

 </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
</div>
          </div>
           <div className="relative">
{(isFilterLoading || isSearchLoading || isPaginationLoading || loading) ? (
  <div className="absolute  w-full h-[300px] bg-white  flex items-center justify-center">
    <div className="bg-white p-4   flex items-center gap-3">
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Bot className="h-8 w-8 animate-spin mx-auto mb-4 text-thunai-primary" />
          <p className="text-thunai-text-secondary">Loading agents...</p>
        </div>
      </div>
    </div>
  </div>
) : (
  //agents grid
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-7">
            {filteredAgents.map((agent) => (
              <Card key={agent.id} className="shadow-soft hover:shadow-medium transition-smooth">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-top gap-3">
                      <div className="w-12 h-12 bg-thunai-primary/10 rounded-lg flex items-center justify-center">
                        <Bot className="h-6 w-6 text-thunai-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                       
 <CardTitle
    className="text-base text-thunai-text-primary break-words overflow-hidden cursor-pointer"
    style={{ 
      wordBreak: 'break-word', 
      overflowWrap: 'break-word',
      lineHeight: '1.3',
      maxHeight: '2.6em', // Approximately 2 lines
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical'
    }}
    onClick={() => handleConfigure(agent)}
    title={agent.name} // Shows full name on hover
  >
    {agent.name}
  </CardTitle>

                        <div className="flex items-center gap-2 mt-1">
                          {getStatusIcon(agent.status)}
                          {getStatusBadge(agent.status)}
                        </div>
                      </div>

                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                       
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 relative">
      <MoreVertical className="h-4 w-4" />
      {(deletingAgentId === agent.id || deactivateAgentId === agent.id || duplicatingAgentId === agent.id) && (
        <Loader2 className="h-3 w-3 animate-spin absolute right-8 text-thunai-primary" />
      )}
    </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleConfigure(agent)}>
                          <Settings className="h-4 w-4 mr-2" />
                           {configuringAgentId === agent.id ? "Loading..." : "Configure"}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
  onClick={() => handleDuplicateAgent(agent)}
  disabled={duplicatingAgentId === agent.id}
>
  <Copy className="h-4 w-4 mr-2" />
  {duplicatingAgentId === agent.id ? "Duplicating..." : "Duplicate"}
</DropdownMenuItem>
                    <DropdownMenuItem 
  className={agent.active ? "text-thunai-negative" : "text-thunai-positive"} 
  onClick={() => agent.active ? handleDeactivateAgent(agent) : handleActivateAgent(agent)}
  disabled={deletingAgentId === agent.id || activatingAgentId === agent.id}
>
  {agent.active ? (
    <Ban className="h-4 w-4 mr-2" />
  ) : (
    <Play className="h-4 w-4 mr-2" />
  )}
  {agent.active ? (
    deletingAgentId === agent.id ? "Deactivating..." : "Deactivate"
  ) : (
    activatingAgentId === agent.id ? "Activating..." : "Activate"
  )}
</DropdownMenuItem>
     <DropdownMenuItem 
  className="text-thunai-negative"
  onClick={() =>handleDeleteClick(agent)}
  disabled={deletingAgentId === agent.id || activatingAgentId === agent.id}
>
 
    <Trash2 className="h-4 w-4 mr-2" />
   { deletingAgentId === agent.id ? "Deleting..." : "Delete"}
 
</DropdownMenuItem>

                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                
<div className="relative group">
  <p 
    className="text-sm text-thunai-text-secondary leading-relaxed line-clamp-2"
    style={{
      height:'34px',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
      lineHeight: '1.25'
    }}
  >
    {agent.description}
  </p>
  
  {/* Tooltip - shows on hover */}
  {agent.description && agent.description.length > 100 && (
    <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 max-w-xs whitespace-normal break-words">
      {agent.description}
      {/* Tooltip arrow */}
      <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
    </div>
  )}
</div>


                  {/* Enabled Interfaces */}
                  <div className="space-y-2">
  <h4 className="text-xs font-medium text-thunai-text-secondary">
    Enabled Interfaces
  </h4>

  {agent.interfaces && agent.interfaces.length > 0 ? (
    <div className="flex gap-2 flex-wrap">
     {agent.interfaces.map((interfaceType) => {
     const label =
        interfaceType === "meeting_agent"
          ? "Meetings"
          : interfaceType === "chatbox"
          ? "Chat"
          : interfaceType.charAt(0).toUpperCase() + interfaceType.slice(1);

      return (
        <Badge
          key={interfaceType}
          variant="secondary"
          className="flex items-center gap-1 text-xs"
        >
          {getInterfaceIcon(interfaceType)}
          {label}
        </Badge>
      );
    })}
    </div>
  ) : (
    <p className="text-xs text-gray-400">NA</p>
  )}
</div>

                  
                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                    <div>
                      <p className="text-xs text-thunai-text-secondary">Conversations</p>
                      <p className="text-lg font-semibold text-thunai-text-primary">
                        {agent.conversationsCount.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-thunai-text-secondary">Success Rate</p>
                      <p className="text-lg font-semibold text-thunai-text-primary">
                        {/* {agent.successRate}% */}
                        100%
                      </p>
                    </div>
                  </div>
                  
                  {/* Footer */}
                  
                  <div className="flex items-center justify-between pt-2 border-t">
  <div className="flex items-center gap-1 text-xs text-thunai-text-secondary">
    <Calendar className="h-3 w-3" />
    Modified {agent.lastModified}
  </div>
  <div className="flex gap-2">
    {!agent.active ? (
      // Show Activate button when agent is not active
     <Button 
  variant="outline" 
  size="sm" 
  onClick={() => handleActivateAgent(agent)}
  className="text-thunai-positive border-thunai-positive hover:bg-thunai-positive/10 hover:text-green-500"
    disabled={activatingAgentId === agent.id}
>
   {activatingAgentId === agent.id ? (
    "Loading..."
  ): (
    <>
      <Play className="h-3 w-3 mr-1" />
      Activate
    </>
  )}
</Button>
    ) : (
      // Show Start/Pause button when agent is active
     <Button 
  variant="outline" 
  size="sm" 
  onClick={() => handleTogglePause(agent)}
  disabled={pausingAgentId === agent.id}
>
  {pausingAgentId === agent.id ? (
    "Loading..."
  ) : agent.paused ? (
    <>
      <Play className="h-3 w-3 mr-1" />
      Start
    </>
  ) : (
    <>
      <Pause className="h-3 w-3 mr-1" />
      Pause
    </>
  )}
</Button>
    )}
    <Button 
      size="sm" 
      className="bg-thunai-primary hover:bg-thunai-primary-light text-white" 
      onClick={() => handleConfigure(agent)}
    >
       {configuringAgentId === agent.id ? (
    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
  ) : (
    <Settings className="h-3 w-3 mr-1" />
  )}
    {configuringAgentId === agent.id ? "Loading..." : "Configure"}
    </Button>
  </div></div>
                </CardContent>
              </Card>
            ))}
          </div>)}
</div>
          {/* Empty State */}
          {filteredAgents.length === 0 && (
            <Card className="shadow-soft">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-thunai-neutral-bg flex items-center justify-center mx-auto">
                    <Bot className="h-6 w-6 text-thunai-accent" />
                  </div>
                  <h3 className="font-medium text-thunai-text-primary">No agents found</h3>
                  <p className="text-sm text-thunai-text-secondary max-w-md">
                    {searchQuery || statusFilter !== "all" 
                      ? "Try adjusting your search or filter criteria."
                      : "Create your first AI agent to get started."}
                  </p>
                  {!searchQuery && statusFilter === "all" && (
          <CreateAgentDialog
  isOpen={isCreateDialogOpen}
  setIsOpen={setIsCreateDialogOpen}
  agentName={agentName}
  setAgentName={setAgentName}
  isCreating={isCreating}
  handleCreateAgent={handleCreateAgent}
  triggerText="Create New Agent"
/>

                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
  <AgentPagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
        {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setAgentToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Agent"
        description={`Are you sure you want to delete "${agentToDelete?.name}"? This action cannot be undone.`}
        isDeleting={deletingAgentId !== null}
      />
    </div>
    
  );
};

export default MyAgents;
