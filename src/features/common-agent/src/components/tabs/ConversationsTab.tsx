import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { MessageCircle, Calendar, ShieldCheck, ShieldX, Phone, Mail, Filter, ChevronDown, Activity, CheckCircle, XCircle, AlertTriangle, Webhook, Code, ArrowRight, Copy, Check, RefreshCw,Loader2} from "lucide-react";
import { useState,useEffect } from "react";
import { fetchConversationHistory } from "../../services/authService";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'; 
import { AgentPagination } from "@/components/ui/agent-pagination"; // Adjust this path if needed
import { useToast } from "@/hooks/use-toast";
import { AgentData } from "../../types/agent";

interface ToolCall {
  id: string;
  timestamp: string;
  toolName: string;
  request: any;
  response: any;
  status: "success" | "error" | "warning";
}
interface LogEntry {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  status: "success" | "error" | "warning";
  toolCall?: ToolCall;
}
interface Conversation {
  id: string;
  timestamp: string;
  snippet: string;
  channel: "Voice" | "Chat" | "Email" | "Webhook" | "API";
  status: "safe" | "flagged";
  duration?: string;
  logs: LogEntry[];
  triggerType?: "user" | "webhook" | "scheduled";
}
interface ConversationsTabProps {
  agentData?: AgentData;
}

export function ConversationsTab({ agentData }: ConversationsTabProps) {
  const [openLogs, setOpenLogs] = useState<string[]>([]);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [collapsedJson, setCollapsedJson] = useState<string[]>([]);
   const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const { toast } = useToast();
  const [expandedSnippets, setExpandedSnippets] = useState<string[]>([]); 
  const [apiResponse, setApiResponse] = useState<any>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<string>("all-channels");
const [selectedDateRange, setSelectedDateRange] = useState<string>("all-dates");
const [currentPage, setCurrentPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
const itemsPerPage = 10;

  const toggleLogs = (conversationId: string) => {
    setOpenLogs(prev => 
      prev.includes(conversationId) 
        ? prev.filter(id => id !== conversationId)
        : [...prev, conversationId]
    );
  };
const toggleSnippet = (id: string) => {
  setExpandedSnippets(prev =>
    prev.includes(id)
      ? prev.filter(sid => sid !== id)
      : [...prev, id]
  );
};
const getDateRange = (range: string) => {
  const now = new Date();
  const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  switch (range) {
    case "today": {
      const start = todayUTC;
      const end = new Date(todayUTC);
      end.setUTCHours(23, 59, 59, 999);
      return {
        start_date: start.toISOString(),
        end_date: end.toISOString(),
      };
    }
    case "week": {
      const day = todayUTC.getUTCDay(); // Sunday = 0
      const weekStart = new Date(todayUTC);
      weekStart.setUTCDate(todayUTC.getUTCDate() - day);
      const weekEnd = new Date(weekStart);
      weekEnd.setUTCDate(weekStart.getUTCDate() + 6);
      weekEnd.setUTCHours(23, 59, 59, 999);
      return {
        start_date: weekStart.toISOString(),
        end_date: weekEnd.toISOString(),
      };
    }
    case "month": {
      const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
      const monthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999));
      return {
        start_date: monthStart.toISOString(),
        end_date: monthEnd.toISOString(),
      };
    }
    default:
      return null;
  }
};
const getConversationType = (type: string) => {
  const typeMap = {
    voice: "Voice",
    chat: "Chat", 
    email: "Email",
    webhook: "Webhook",
    api: "API",
     meeting_agent: "Meetings"
  };
  return typeMap[type as keyof typeof typeMap] || type;
};
const handleError = (error: any, fallbackMessage: string) => {
  console.error(fallbackMessage, error);
  toast({
    title: "Error",
    description: error.message || fallbackMessage,
    variant: "destructive",
  });
};
const handleRefresh = async () => {
  try {
    setIsRefreshing(true);
    await loadConversationHistory();
  } catch (error) {
    handleError(error, "Failed to refresh agents");
  } finally {
    setIsRefreshing(false);
  }
};
  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(label);
      toast({
        title: "Copied to clipboard",
        description: `${label} copied successfully`,
      });
      setTimeout(() => setCopiedText(null), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };
const formatToIST = (dateString: string) => {
  try {
    const date = new Date(dateString + "Z");
    return date.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch (error) {
    console.error("Time formatting error:", error);
    return "Invalid Time";
  }
};

 useEffect(() => {
    loadConversationHistory();
  }, [agentData?.widget_id, toast,selectedChannel,selectedDateRange,currentPage]);

  const loadConversationHistory = async () => {
      if (!agentData?.widget_id) {
        setError("No widget ID available");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const payload:any = {
            widget_id: agentData.widget_id,
    page: {
        page_number: currentPage,
        size: itemsPerPage
    }
        }
        if (selectedChannel !== "all-channels") {
      payload.type = selectedChannel;
    }
     const dateRange = getDateRange(selectedDateRange);
    if (dateRange) {
      payload.start_date = dateRange.start_date;
      payload.end_date = dateRange.end_date;
    }
        const response = await fetchConversationHistory("POST",payload, agentData.widget_id);
        
        if (response.status === 'success') {
          setApiResponse(response);
      
   
      setTotalPages(response.total_pages);

        } else {
          setError("Failed to load conversation history");
        }
      } catch (err: any) {
        console.error("Error loading conversation history:", err);
        setError(err.message || "Failed to load conversation history");
        toast({
          title: "Error",
          description: "Failed to load conversation history",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    const handlePageChange = (pageNumber: number) => {
  setCurrentPage(pageNumber);
};
  const toggleJsonCollapse = (id: string) => {
    setCollapsedJson(prev => 
      prev.includes(id) 
        ? prev.filter(jsonId => jsonId !== id)
        : [...prev, id]
    );
  };

  const formatJsonForDisplay = (obj: any) => {
    return JSON.stringify(obj, null, 2);
  };

  const isJsonLarge = (obj: any) => {
    return JSON.stringify(obj).length > 500;
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "Voice": return <Phone className="h-4 w-4" />;
      case "Email": return <Mail className="h-4 w-4" />;
      case "Webhook": return <Webhook className="h-4 w-4" />;
      case "API": return <Code className="h-4 w-4" />;
      case "Meetings": return <Calendar className="h-4 w-4" />; 
      default: return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getTriggerBadge = (triggerType?: string) => {
    if (!triggerType) return null;
    
    const config = {
      user: { label: "User Initiated", className: "bg-thunai-accent/10 text-thunai-accent border-thunai-accent" },
      webhook: { label: "Webhook", className: "bg-thunai-secondary/10 text-thunai-secondary border-thunai-secondary" },
      scheduled: { label: "Scheduled", className: "bg-thunai-warning/10 text-thunai-warning border-thunai-warning" }
    };
    
    const trigger = config[triggerType as keyof typeof config];
    if (!trigger) return null;
    
    return (
      <Badge className={`${trigger.className} text-xs`}>
        {trigger.label}
      </Badge>
    );
  };

  const getLogStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-thunai-positive" />;
      case "error":
        return <XCircle className="h-4 w-4 text-thunai-negative" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-thunai-warning" />;
      default:
        return <Activity className="h-4 w-4 text-thunai-accent" />;
    }
  };

  const getLogStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return (
          <Badge className="bg-thunai-positive/10 text-thunai-positive border-thunai-positive text-xs">
            Success
          </Badge>
        );
      case "error":
        return (
          <Badge className="bg-thunai-negative/10 text-thunai-negative border-thunai-negative text-xs">
            Error
          </Badge>
        );
      case "warning":
        return (
          <Badge className="bg-thunai-warning/10 text-thunai-warning border-thunai-warning text-xs">
            Warning
          </Badge>
        );
      default:
        return <Badge variant="outline" className="text-xs">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-semibold text-thunai-text-primary">Conversation History</h2>
          <p className="text-thunai-text-secondary">
            Review past interactions and their security outcomes
          </p>
        </div>
        <div className="flex gap-2">
       <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
            <SelectTrigger className="w-40">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-dates">All Dates</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedChannel} onValueChange={setSelectedChannel}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-channels">All Channels</SelectItem>
              <SelectItem value="voice">Voice</SelectItem>
              <SelectItem value="chat">Chat</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="webhook">Webhook</SelectItem>
              <SelectItem value="api">API</SelectItem>
              <SelectItem value="meeting_agent">Meetings</SelectItem>

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
      </div>
  {loading && (
      <Card className="shadow-soft">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-thunai-accent animate-spin mb-3" />
          <p className="text-sm text-thunai-text-secondary">Loading conversations...</p>
        </CardContent>
      </Card>

    )}
   {!loading &&!isRefreshing&&
<div className="space-y-4">
  {apiResponse?.data?.map((conversation: any) => (
    <Card key={conversation.uniqueid} className="shadow-soft hover:shadow-medium transition-smooth mb-[50px]">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-4">
            {/* Header Row */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                {getChannelIcon(getConversationType(conversation.type))}
  <span className="font-medium text-thunai-text-primary">
    {getConversationType(conversation.type)}
  </span>
              </div>
              <Badge variant="outline" className="text-xs">
                {formatToIST(conversation.conversation_time)}
              </Badge>
              {/* <Badge variant="outline" className="text-xs">
                Credits: {conversation.credits || "-"}
              </Badge> */}
            </div>

            {/* Conversation Summary */}
            {/* <div className="space-y-2" >
              <h4 className="text-sm font-semibold text-thunai-text-primary">Summary:</h4>
              <div
                className={`text-sm text-thunai-text-secondary leading-[1.8] prose prose-sm max-w-none ${
                  expandedSnippets.includes(`${conversation.uniqueid}-summary`) ? "" : "line-clamp-3 overflow-hidden"
                }`}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {conversation.conversation_summary || "No summary available"}
                </ReactMarkdown>
              </div>

              {conversation.conversation_summary && conversation.conversation_summary.split(" ").length > 15 && (
                <button
                  onClick={() => toggleSnippet(`${conversation.uniqueid}-summary`)}
                  className="text-xs text-thunai-accent hover:underline"
                >
                  {expandedSnippets.includes(`${conversation.uniqueid}-summary`) ? "Show Less" : "Show More"}
                </button>
              )}
            </div> */}
            <div className="space-y-2">
  <h4 className="text-sm font-semibold text-thunai-text-primary">Summary:</h4>
  <div
    className={`text-sm text-thunai-text-secondary leading-[1.8] prose prose-sm max-w-none ${
      expandedSnippets.includes(`${conversation.uniqueid}-summary`) ? "" : "line-clamp-3 overflow-hidden"
    }`}
    style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
  >
    <ReactMarkdown 
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => (
          <p style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
            {children}
          </p>
        ),
        div: ({ children }) => (
          <div style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
            {children}
          </div>
        ),
        span: ({ children }) => (
          <span style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
            {children}
          </span>
        ),
        code: ({ children }) => (
          <code style={{ wordBreak: 'break-all', overflowWrap: 'break-word' }} className="bg-gray-100 px-1 py-0.5 rounded text-xs">
            {children}
          </code>
        ),
        pre: ({ children }) => (
          <pre style={{ wordBreak: 'break-all', overflowWrap: 'break-word', whiteSpace: 'pre-wrap' }} className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
            {children}
          </pre>
        ),
      }}
    >
      {conversation.conversation_summary || "No summary available"}
    </ReactMarkdown>
  </div>

  {conversation.conversation_summary && conversation.conversation_summary.split(" ").length > 15 && (
    <button
      onClick={() => toggleSnippet(`${conversation.uniqueid}-summary`)}
      className="text-xs text-thunai-accent hover:underline"
    >
      {expandedSnippets.includes(`${conversation.uniqueid}-summary`) ? "Show Less" : "Show More"}
    </button>
  )}
</div>

          </div>

          {/* Status Column */}
          {/* <div className="flex flex-col items-end gap-2">
            {getStatusIcon("safe")}
            {getStatusBadge("safe")}
          </div> */}
        </div>

        {/* Conversation History Section - SEPARATE DIV */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between items-center">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => toggleSnippet(`${conversation.uniqueid}-history`)}
              className="flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              View Conversation
              <ChevronDown className={`h-4 w-4 transition-transform ${expandedSnippets.includes(`${conversation.uniqueid}-history`) ? 'rotate-180' : ''}`} />
            </Button>
          </div>

          {/* Collapsible Conversation History */}
          {expandedSnippets.includes(`${conversation.uniqueid}-history`) && (
            <div className="mt-3 space-y-3">
              <h4 className="text-sm font-medium text-thunai-text-primary flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Conversation History
              </h4>
              <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50/30">
                <div className="space-y-3">
                  {conversation.conversation_history?.map((exchange: any, index: number) => (
                    <div key={index} className="space-y-2">
                      {/* User Message */}
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-blue-700">You</span>
                        </div>
                        <div className="flex-1 bg-white border border-blue-200 rounded-lg p-3 shadow-sm">
                          <p className="text-sm text-gray-800 whitespace-pre-wrap"> {exchange.user?.trim() ? exchange.user : "NA"}</p>
                        </div>
                      </div>
                      
                      {/* Agent Response */}
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-green-700">AI</span>
                        </div>
                        <div className="flex-1 bg-white border border-green-200 rounded-lg p-3 shadow-sm text-sm leading-1">
                          {/* <p className="text-sm text-gray-800 whitespace-pre-wrap">  */}
                            <ReactMarkdown components={{
   p: ({ children }) => (
          <p style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }} className="text-sm">
            {children}
          </p>
        ),
    code: ({ children }) => (
          <code style={{ wordBreak: 'break-all', overflowWrap: 'break-word' }} className="bg-gray-100 px-1 py-0.5 rounded text-xs">
            {children}
          </code>
        ),
        pre: ({ children }) => (
          <pre style={{ wordBreak: 'break-all', overflowWrap: 'break-word', whiteSpace: 'pre-wrap' }} className="bg-gray-100 p-2 rounded text-xs overflow-x-auto ">
            {children}
          </pre>
        ),
  }}>
                           {conversation.type === "chat" ? (exchange.model?.trim() || "NA") : (exchange.agent?.trim() || "NA")}
                            </ReactMarkdown>
                            {/* </p> */}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {(!conversation.conversation_history || conversation.conversation_history.length === 0) && (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-sm">No conversation history available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* View Logs Section - SEPARATE DIV */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between items-center">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => toggleLogs(conversation.uniqueid)}
              className="flex items-center gap-2"
            >
              <Activity className="h-4 w-4" />
              View Logs
              <ChevronDown className={`h-4 w-4 transition-transform ${openLogs.includes(conversation.uniqueid) ? 'rotate-180' : ''}`} />
            </Button>
       
          </div>

          {/* Collapsible Logs */}
          {openLogs.includes(conversation.uniqueid) && (
            <div className="mt-3 space-y-3">
              {/* <h4 className="text-sm font-medium text-thunai-text-primary flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Activity Logs
              </h4> */}
              <div className="space-y-2">
                {conversation.agent_logs?.map((log: any, logIndex: number) => (
                  <div key={`${conversation.uniqueid}-${logIndex}`} className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-thunai-neutral-bg/30 rounded-lg">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {/* {getLogStatusIcon(log.api_status_code === 200 ? "success" : "error")} */}
                        {/* {getLogStatusIcon(log.api_status_code >= 200 && log.api_status_code <= 299 ? "success" : "error")} */}
                                             {/* <div className="flex-shrink-0"> */}
  {log.api_status_code == null
    ? <span className="text-muted-foreground"></span>
    : getLogStatusIcon(
        log.api_status_code >= 200 && log.api_status_code <= 299
          ? "success"
          : "error"
      )
  }
{/* </div> */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-thunai-text-primary">{log.purpose}</span>
                            <span className="text-xs text-thunai-text-secondary font-mono">{formatToIST(log.updated)}</span>
                          </div>
                          <p className="text-xs text-thunai-text-secondary">
                            {log.api_method} {log.api_url} - Status: {log.api_status_code || "NA"}
                          </p>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {/* {getLogStatusBadge(log.api_status_code === 200 ? "success" : "error")} */}
                      {/* {getLogStatusBadge(log.api_status_code >= 200 && log.api_status_code <= 299 ? "success" : "error")} */}           
  {log.api_status_code == null
    ? <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
  <span className="w-2 h-2 rounded-full bg-gray-500"></span>
  Initiated
</span>

    : getLogStatusIcon(
        log.api_status_code >= 200 && log.api_status_code <= 299
          ? "success"
          : "error"
      )
  }
                      </div>
                    </div>
                    
                    {/* Tool Call Details */}
                    <div className="ml-6 pl-4 border-l-2 border-thunai-accent/20">
                      <div className="bg-white border border-border rounded-lg p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <Code className="h-4 w-4 text-thunai-accent" />
                          <span className="text-sm font-medium text-thunai-text-primary">
                            Tool: {conversation.type}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {/* Request Section */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                <ArrowRight className="h-3 w-3 text-thunai-accent" />
                                <span className="text-xs font-medium text-thunai-text-primary">Request</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(formatJsonForDisplay(log.api_payload), "Request JSON")}
                                className="h-6 px-2 text-xs"
                              >
                                {copiedText === "Request JSON" ? (
                                  <Check className="h-3 w-3" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                            <div className="bg-thunai-neutral-bg/50 border rounded text-xs  max-h-60 overflow-auto">
                              <pre className="p-2 overflow-auto whitespace-pre-wrap break-words">
                                {formatJsonForDisplay(log.api_payload)}
                              </pre>
                            </div>
                          </div>
                          
                          {/* Response Section */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                <ArrowRight className="h-3 w-3 text-thunai-positive rotate-180" />
                                <span className="text-xs font-medium text-thunai-text-primary">Response</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(formatJsonForDisplay(log.api_response), "Response JSON")}
                                className="h-6 px-2 text-xs"
                              >
                                {copiedText === "Response JSON" ? (
                                  <Check className="h-3 w-3" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                            <div className="bg-thunai-neutral-bg/50 border rounded text-xs overflow-auto max-h-60">
                              <pre className="p-2 overflow-auto whitespace-pre-wrap break-words">
                                {formatJsonForDisplay(log.api_response)}
                              </pre>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
                       {(!conversation.agent_logs || conversation.agent_logs.length === 0) && (
  <div className="text-center py-8 text-gray-500">
    <p className="text-sm">No logs available</p>
  </div>
)}
       </div>
          )}
        </div>  
      </CardContent>
    </Card>
  ))}
</div>}

{/* Empty State */}
{!loading && (!apiResponse?.data || apiResponse.data.length === 0) && (
  <Card className="shadow-soft">
    <CardContent className="flex flex-col items-center justify-center py-12">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-thunai-neutral-bg flex items-center justify-center mx-auto">
          <MessageCircle className="h-6 w-6 text-thunai-accent" />
        </div>
        <h3 className="font-medium text-thunai-text-primary">No conversations yet</h3>
        <p className="text-sm text-thunai-text-secondary max-w-md">
          Once your agent starts interacting with users, their conversation history will appear here.
        </p>
      </div>
    </CardContent>
  </Card>
)}
  <div className="fixed bottom-0 left-0 right-0 ">
    <div className=" mx-auto ">
      <AgentPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  </div>
    </div>
  );
}