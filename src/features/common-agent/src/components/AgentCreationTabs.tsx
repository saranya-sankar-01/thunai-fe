import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Workflow, Shield, MessageCircle, Activity, Palette ,ArrowLeft } from "lucide-react";
import { BasicInstructionsTab } from "./tabs/BasicInstructionsTab";
import { WorkflowsTab } from "./tabs/WorkflowsTab";
import { SecurityTab } from "./tabs/SecurityTab";
import { ConversationsTab } from "./tabs/ConversationsTab";
import { WidgetTab } from "./tabs/WidgetTab";

import { AgentActionBar } from "./AgentActionBar";
import { useState, useRef,useEffect } from "react";
import { AgentData } from "../types/agent";
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { saveAgent } from "../services/authService";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function AgentCreationTabs() {
  const navigate = useNavigate();
   const { toast } = useToast();
   const [testAgentSaved, setTestAgentSaved] = useState(false);
   const [emailPrefixSaved, setEmailPrefixSaved] = useState(false);
   const [agentData, setAgentData] = useState<AgentData>({
    agentName: "",
    agentDescription: "",
    agentInstructions: "",
     info_not_talk_about: "",
   custom_auth_flow: false,
   custom_auth_endpoints:{
    refresh_token_endpoint:""
   },

  fields: {
    defaultItems: [],
    customItems: []
  },
    tools: {
      brain: false,
      analytics: false,
      canvas: false,
      mcp: false,
      web_search: false,
    },
     agentType: undefined,
    interfaces: {
      voice: {
        enabled: false,
        selectedVoice: "",
        selectedLanguage:"",
      
        enableScreenShare: false,        // Add this
      storeConversationAudio: false,   // Add this
      agentDuration: "",               // Add this
      enableDurationLimit: false,      // Add this
      process_transcript:false
      },
      chatbox: {
        enabled: false,
        enableInPortal: false,
        primaryColor: "#3B82F6",
        bubbleShape: "rounded",
        position: "right",
        persistHistory: false,
        typingDelay: "medium",
        enable_file_upload:false,
        trademark:false,
        faqs:[]
      },
      email: {
        enabled: false,
        prefered_mail: "",
        fromName: "",
        signature: "",
        customEmail:"",
        ignoreDomains:[],
        reply_email:false,
        mail_box_email:"",
      },
      meeting_agent: {
        enabled: false,
        meeting_apply: "",
      },
    },
     workflow_type:"",
     widget: {
      theme: "light",
      border_radius: "8",
      widget_position: "right",
      intial_message: "Hi! How can I help you today?",
      placeholder: "Type your message...",
      agentName: "AI Assistant",
      show_beacon: true,
      display_type:"all",
      is_reasoning:false,
      primary_color:"#3B82F6",//header
secondary_color:"#DEDEDE",//bot message
tertiary_color:"#1E293B",//user message
widget_bg_color:"#FFFFFF",
selectedIconUrl:"",
widget_text:"",
name:"classic",
logo:"",
user_text:'#FFFFFF',
bot_text:'#000000'
    },
      access_control: {
        // directory_id: "",
    enableAccessControl: false,
    auth_type: "",
    app_id:"",
    access_rules: [
      {
        attribute: "",
        operator: "",
        value: "",
        ai_instruction: ""
      }
    ]
  },
   throttling_settings: {
    enabled: false,
    max_user_block_time: null,
    max_websocket_request_seconds: null,
    max_count_per_seconds: null,
    websocket_rate_limit_window: null,
    max_websocket_requests_per_window: null,
  },
  });
   const { id: agentId } = useParams();
  const location = useLocation();
  const isEditMode = agentId && location.pathname.includes('/edit');
const hasAppliedPrepopulated = useRef(false);
  useEffect(() => {
  const prepopulatedData = location.state?.prepopulatedData;
  
  if (prepopulatedData && !hasAppliedPrepopulated.current) {
    setAgentData(prev => ({
      ...prev,
      ...prepopulatedData,
    }));
    hasAppliedPrepopulated.current = true;
  }
     if (isEditMode && prepopulatedData?.interfaces?.email?.prefered_mail) {
        setEmailPrefixSaved(true);
      }
    if (isEditMode && prepopulatedData?.interfaces) {
    const hasVoiceOrChat = prepopulatedData.interfaces.voice?.enabled || 
                          prepopulatedData.interfaces.chatbox?.enabled;
    
    if (hasVoiceOrChat) {
      setTestAgentSaved(true);
    }
  }
}, [location.state?.prepopulatedData]);

// Reset when navigating to different agent
useEffect(() => {
  hasAppliedPrepopulated.current = false;
}, [location.pathname]);
  //   const handleBackToHome = () => {
  //     navigate(-1);
  // };
  const handleBackToHome = () => {
  navigate('/common-agent', { 
    state: { showSearchLoader: true }
  });
};
  const handleSave =async () => {
if (
    agentData.interfaces.email.enabled && 
    (agentData.interfaces.email.agent_provider === "thunai" || !agentData.interfaces.email.agent_provider) && 
    !agentData.interfaces.email.prefered_mail?.trim()
) {
    throw new Error("Please enter a preferred email before saving.");
}
     const enabledInterfaces = Object.entries(agentData.interfaces)
    .filter(([_, config]) => config.enabled)
    .map(([key]) => key);

  const enabledTools = Object.entries(agentData.tools)
    .filter(([_, enabled]) => enabled)
    .map(([key]) => key);
   
    const payload = {
           id: isEditMode ? agentId : agentData.id, 
      name: agentData.agentName,
      agent_name: agentData.agentName,
      agent_instructions: agentData.agentInstructions,
      description:agentData.agentDescription,
      interface: enabledInterfaces,
      tools: enabledTools,
      primary_color: agentData.interfaces.chatbox.primaryColor,
     ...(agentData.tools.canvas
  ? { enable_canvas: true }
  : { enable_canvas: false }),
   custom_auth_flow: agentData.custom_auth_flow || false,
   custom_auth_endpoints:agentData.custom_auth_endpoints || {},
    // widget_position: agentData.widget.widget_position,
      // widget_bg_color: agentData.widget.primaryColor,
      intial_message: agentData.widget.intial_message,
      
       enable_share_screen: agentData.interfaces.voice.enableScreenShare || false,
       store_conversation_audio: agentData.interfaces.voice.storeConversationAudio || false,
       info_not_talk_about: agentData.info_not_talk_about,
       agent_voice_id:agentData.interfaces.voice.selectedVoice,
      agent_language: Array.isArray(agentData.interfaces.voice.selectedLanguage) 
  ? agentData.interfaces.voice.selectedLanguage.join(',') 
  : agentData.interfaces.voice.selectedLanguage || '',
     meeting_apply:agentData.interfaces.meeting_agent.meeting_apply || null,
     multi_select_users:agentData.interfaces.meeting_agent.multi_select_users,

      widget_template: {
        theme: agentData.widget.theme,
        widget_position:agentData.widget.widget_position || "right",
        border_radius: agentData.widget.border_radius || "8",
  display_type:agentData.widget.display_type,
  is_reasoning:agentData.widget.is_reasoning,
      show_beacon: agentData.widget.show_beacon,
       primary_color: agentData.widget.primary_color || "#3B82F6",
      secondary_color: agentData.widget.secondary_color || "#DEDEDE", 
      tertiary_color: agentData.widget.tertiary_color || "#1E293B",
      widget_bg_color: agentData.widget.widget_bg_color || 
        ((agentData.widget.theme || "light") === "dark" ? "#000000" : "#FFFFFF"),

    trademark:agentData.interfaces.chatbox.trademark || false,
    icon:agentData.widget.selectedIconUrl || "",
    widget_text:agentData.widget.widget_text || "",
    bubble_shape:agentData.interfaces.chatbox.bubbleShape || "round",
    logo:agentData.widget.logo,
    user_text:agentData.widget.user_text || "#FFFFFF",
    bot_text:agentData.widget.bot_text || "#000000",
    // name:agentData.widget.name || "classic",
process_transcript:agentData.interfaces.chatbox.process_transcript || false,
      },
    ...( {
  email: agentData.interfaces.email.enabled
    ? {
        prefered_mail: agentData.interfaces.email.prefered_mail,
        ignored_domains: agentData.interfaces.email.ignoreDomains,
        custom_from_email: agentData.interfaces.email.customEmail || "",
        signature: agentData.interfaces.email.signature,
        reply_email:agentData.interfaces.email.reply_email || false,
        agent_provider: agentData.interfaces.email.agent_provider || "thunai",
        agent_application_id: agentData.interfaces.email.agent_application_id || "",
        mail_box_email: agentData.interfaces.email.mail_box_email || ""
      }
    : {}
}),
    enable_file_upload:agentData.interfaces.chatbox.enable_file_upload || false,
     agent_duration: agentData.interfaces.voice.agentDuration || null,
      process_transcript:agentData.interfaces.voice.process_transcript || false,
      enable_duration: agentData.interfaces.voice.enableDurationLimit || false,
      sentiment_suggestion:agentData.interfaces.voice.sentiment_suggestion || false,

    // Voice specific config (if voice is enabled)
    ...(agentData.interfaces.voice.enabled && {
      voice: {
        agent_duration: agentData.interfaces.voice.agentDuration,
      enable_duration: agentData.interfaces.voice.enableDurationLimit || false,
      process_transcript:agentData.interfaces.voice.process_transcript || false,
      sentiment_suggestion:agentData.interfaces.voice.sentiment_suggestion || false,
     agent_language: Array.isArray(agentData.interfaces.voice.selectedLanguage) 
  ? agentData.interfaces.voice.selectedLanguage.join(',') 
  : agentData.interfaces.voice.selectedLanguage || '',
      }
    }),
     workflow_type:"version_3",
    faqs:agentData.interfaces.chatbox.faqs,
     access_control: agentData.access_control?.enableAccessControl ? {
      enableAccessControl: agentData.access_control.enableAccessControl,
      auth_type: agentData.access_control.auth_type,
      app_id:agentData.access_control.app_id,
      // directory_id: agentData.access_control.directory_id,
      access_rules: agentData.access_control.access_rules
    } : {},

     throttling_settings: {
      enabled: agentData.throttling_settings?.enabled || false,
      max_user_block_time: agentData.throttling_settings?.max_user_block_time || null,
      max_websocket_request_seconds: agentData.throttling_settings?.max_websocket_request_seconds || null,
      max_count_per_seconds: agentData.throttling_settings?.max_count_per_seconds || null,
      websocket_rate_limit_window: agentData.throttling_settings?.websocket_rate_limit_window || null,
      max_websocket_requests_per_window: agentData.throttling_settings?.max_websocket_requests_per_window || null,
    },
    };
    // console.log(payload)
     const result = await saveAgent(payload, isEditMode ? agentId : undefined,"PATCH");
 if (result && agentData.interfaces.email.prefered_mail?.trim()) {
      setEmailPrefixSaved(true);
    }
    if (agentData.interfaces.voice.enabled || agentData.interfaces.chatbox.enabled) {
    setTestAgentSaved(true);
  }
     return result
  };
  return (
    <div className="space-y-6">
       <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBackToHome}
          className="flex items-center gap-2 text-thunai-text-secondary hover:text-thunai-text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-thunai-text-primary">
  {isEditMode ? "Edit Agent" : "Create Agent"}
</h1>
        <p className="text-thunai-text-secondary">
          Define instructions, workflows, security, and logs. Save and test anytime.
        </p>
      </div>

      <Tabs defaultValue="basic" className="space-y-6">
        {/* Tab List with Action Bar */}
        <div className="flex items-center justify-between sticky top-0 bg-background py-2 z-10">
          <TabsList className={`grid ${isEditMode ? "grid-cols-5" : "grid-cols-4"} bg-white border border-border p-1 rounded-xl shadow-soft`}>
            <TabsTrigger 
              value="basic" 
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-smooth data-[state=active]:bg-thunai-primary data-[state=active]:text-white data-[state=inactive]:text-thunai-text-primary hover:text-thunai-accent-2"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Basic Setup</span>
              <span className="sm:hidden">Basic</span>
            </TabsTrigger>
            <TabsTrigger 
              value="workflows"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-smooth data-[state=active]:bg-thunai-primary data-[state=active]:text-white data-[state=inactive]:text-thunai-text-primary hover:text-thunai-accent-2"
            >
              <Workflow className="h-4 w-4" />
              <span className="hidden sm:inline">Workflows</span>
              <span className="sm:hidden">Flows</span>
            </TabsTrigger>
            <TabsTrigger 
              value="security"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-smooth data-[state=active]:bg-thunai-primary data-[state=active]:text-white data-[state=inactive]:text-thunai-text-primary hover:text-thunai-accent-2"
            >
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
              <span className="sm:hidden">Security</span>
            </TabsTrigger>
             {isEditMode && (
            <TabsTrigger 
              value="conversations"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-smooth data-[state=active]:bg-thunai-primary data-[state=active]:text-white data-[state=inactive]:text-thunai-text-primary hover:text-thunai-accent-2"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Conversations</span>
              <span className="sm:hidden">Chat</span>
            </TabsTrigger>)}
            <TabsTrigger 
              value="widget"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-smooth data-[state=active]:bg-thunai-primary data-[state=active]:text-white data-[state=inactive]:text-thunai-text-primary hover:text-thunai-accent-2"
            >
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Widget</span>
              <span className="sm:hidden">Widget</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Action Bar */}
       <AgentActionBar 
  onSave={handleSave} 
  widgetId={agentData.widget_id} 
  interfaces={agentData.interfaces}  
  initialInterfaces={location.state?.prepopulatedData?.interface || []} // This should contain the saved interfaces
  testAgentSaved={testAgentSaved}
/>        </div>

        <TabsContent value="basic" className="space-y-6">
           <BasicInstructionsTab 
            data={agentData} 
            onChange={setAgentData} 
            emailPrefixSaved={emailPrefixSaved}
          />
        </TabsContent>

        <TabsContent value="workflows" className="space-y-6">
          <WorkflowsTab  agentData={agentData} 
             onDataChange={(updates) => setAgentData(prev => ({ ...prev, ...updates }))}/>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <SecurityTab   agentData={agentData} onChange={(updates) => setAgentData(prev => ({ ...prev, ...updates }))}
  />
        </TabsContent>

        {isEditMode && (
  <TabsContent value="conversations" className="space-y-6">
    <ConversationsTab agentData={agentData} />
  </TabsContent>
)}

        <TabsContent value="widget" className="space-y-6">
           <WidgetTab 
            config={agentData} 
           onChange={(updates) => setAgentData(prev => ({ ...prev, ...updates }))}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}