import { useState } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronUp, X, Loader2, BarChart, PenTool, Search, Globe } from 'lucide-react';
import { set } from 'date-fns';

interface ToolsDropdownProps {
  onToolSelect: (tool: string) => void;
activeTab?: string;
  // Canvas
  onCanvasClick: () => void;
  isCanvasLoading?: boolean;
  onCancelCanvas?: () => void;
  contentAgentConnected?: boolean;

  // Analytics
  onAnalyticsClick?: () => void;
  isAnalyticsLoading?: boolean;
  onCancelAnalytics?: () => void;
  analyticsAgentConnected?: boolean;

  // Web Search
  onWebSearchClick?: () => void;
  isWebSearchLoading?: boolean;
  onCancelWebSearch?: () => void;
  webSearchAgentConnected?: boolean;

  // MCP
  onMcpClick?: () => void;
  isMcpLoading?: boolean;
  onCancelMcp?: () => void;
  mcpAgentConnected?: boolean;
  isUserTyping?: boolean;
}

export const ToolsDropdown = ({ 
  onToolSelect,
  isUserTyping,
  // Canvas
  onCanvasClick,
  isCanvasLoading = false,
  onCancelCanvas = () => {},
  contentAgentConnected = false,

  // Analytics
  onAnalyticsClick = () => {},
  isAnalyticsLoading = false,
  onCancelAnalytics = () => {},
  analyticsAgentConnected = false,

  // Web Search
  onWebSearchClick = () => {},
  isWebSearchLoading = false,
  onCancelWebSearch = () => {},
  webSearchAgentConnected = false,

  // MCP
  onMcpClick = () => {},
  isMcpLoading = false,
  onCancelMcp = () => {},
  mcpAgentConnected = false
}: ToolsDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToolClick = (toolId: string) => {
    setIsOpen(false);
    if (toolId === 'canvas') {
      if (analyticsAgentConnected) onCancelAnalytics();
      if (webSearchAgentConnected) onCancelWebSearch();
      if (mcpAgentConnected) onCancelMcp();
      onCanvasClick();
    } 
    // else if (toolId === 'analytics') {
    //   if (contentAgentConnected) onCancelCanvas();
    //   if (webSearchAgentConnected) onCancelWebSearch();
    //   if (mcpAgentConnected) onCancelMcp();
    //   onAnalyticsClick();
    // }
    else if (toolId === 'websearch') {
      if (contentAgentConnected) onCancelCanvas();
      if (analyticsAgentConnected) onCancelAnalytics();
      if (mcpAgentConnected) onCancelMcp();
      onWebSearchClick();
    }
    else if (toolId === 'mcp') {
      if (contentAgentConnected) onCancelCanvas();
      if (analyticsAgentConnected) onCancelAnalytics();
      if (webSearchAgentConnected) onCancelWebSearch();
      onMcpClick();
    }
    else {
      onToolSelect(toolId);
    }
    // setIsOpen(false);
    
  };

  const StatusItem = ({ icon: Icon, label, onCancel, loading, connected }: any) => (
    <div className={`flex items-center text-xs px-3 py-2 rounded-md shadow-sm border w-full ${
      connected ? 'bg-green-100' : 'bg-white'
    }`}>
      {!connected && loading ? (
        <div className="flex items-center">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="ml-2 whitespace-nowrap">Please wait...</span>
        </div>
      ) : connected ? (
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </div>
          <button 
            onClick={onCancel}
            className="ml-4 p-1 bg-gray-100 rounded-full shadow-md hover:bg-gray-200"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : null}
    </div>
  );

  return (
    <div className="flex items-center gap-2 relative">
      {/* Dropdown */}
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger disabled={!isUserTyping} asChild>
          <button className={`rounded-xl px-3 py-2 text-sm font-medium transition-colors flex items-center gap-1
    ${
      isUserTyping
        ? "bg-muted text-primary hover:bg-muted/80"
        : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
    }`}>
            Tools
            <ChevronUp className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-44 bg-white border rounded-xl shadow-md z-50">
          {/* Canvas */}
          <DropdownMenuItem
            onClick={() => handleToolClick('canvas')}
            disabled={isCanvasLoading || contentAgentConnected}
            className={`w-full text-left px-4 py-2 hover:bg-muted cursor-pointer flex items-center gap-2 ${isCanvasLoading ? 'opacity-50' : ''}`}
          >
            <PenTool className="h-4 w-4" />
            Canvas
          </DropdownMenuItem>

          {/* Analytics */}
          {/* <DropdownMenuItem
            onClick={() => handleToolClick('analytics')}
            disabled={isAnalyticsLoading}
            className={`w-full text-left px-4 py-2 hover:bg-muted cursor-pointer flex items-center gap-2 ${isAnalyticsLoading ? 'opacity-50' : ''}`}
          >
            <BarChart className="h-4 w-4" />
            Analytics
          </DropdownMenuItem> */}

          {/* Web Search */}
          <DropdownMenuItem
            onClick={() => handleToolClick('websearch')}
            disabled={isWebSearchLoading || webSearchAgentConnected}
            className={`w-full text-left px-4 py-2 hover:bg-muted cursor-pointer flex items-center gap-2 ${isWebSearchLoading ? 'opacity-50' : ''}`}
          >
            <Search className="h-4 w-4" />
            Web Search
          </DropdownMenuItem>

          {/* MCP */}
          <DropdownMenuItem
            onClick={() => handleToolClick('mcp')}
            disabled={isMcpLoading || mcpAgentConnected}
            className={`w-full text-left px-4 py-2 hover:bg-muted cursor-pointer flex items-center gap-2 ${isMcpLoading ? 'opacity-50' : ''}`}
          >
            <Globe className="h-4 w-4" />
            MCP
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Status inline */}
      {(isCanvasLoading || contentAgentConnected) && (
        <StatusItem icon={PenTool} label="Canvas" onCancel={onCancelCanvas} loading={isCanvasLoading} connected={contentAgentConnected} />
      )}
      {(isAnalyticsLoading || analyticsAgentConnected) && (
        <StatusItem icon={BarChart} label="Analytics" onCancel={onCancelAnalytics} loading={isAnalyticsLoading} connected={analyticsAgentConnected} />
      )}
      {(isWebSearchLoading || webSearchAgentConnected) && (
        <StatusItem icon={Search} label="Web Search" onCancel={onCancelWebSearch} loading={isWebSearchLoading} connected={webSearchAgentConnected} />
      )}
      {(isMcpLoading || mcpAgentConnected) && (
        <StatusItem icon={Globe} label="MCP" onCancel={onCancelMcp} loading={isMcpLoading} connected={mcpAgentConnected} />
      )}
    </div>
  );
};
