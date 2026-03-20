// types/agent.ts
export interface AgentData {
  // Basic Instructions
  id?:string
  agentName: string;
  agentDescription: string;
  agentInstructions: string;
  info_not_talk_about?:string
   custom_auth_flow?: boolean;
   custom_auth_endpoints?:{
refresh_token_endpoint?:string
   };

     fields: {
    defaultItems: string[];
    customItems: string[];
  };

   access_control?: {
    enableAccessControl: boolean;
    auth_type: string;
    app_id:string;
    // directory_id?: string;
    access_rules: Array<{
      attribute: string;
      operator: string;
      value: string;
      ai_instruction: string;
    }>;
  };

  tools: {
    brain: boolean;
    analytics: boolean;
    canvas: boolean;
    mcp: boolean;
    web_search: boolean;
  };
    agentType?: "sales_agent" | "support_agent" | "kb_agent";
  interfaces: {
    voice: {
      enabled: boolean;
      selectedVoice: string;
    //   language: string[];
      enableScreenShare?: boolean;
    enableDurationLimit?: boolean;
    agentDuration?: string;
    storeConversationAudio?:boolean;
selectedLanguage?:string;
process_transcript?:boolean;
sentiment_suggestion?:boolean;
    };
    chatbox: {
      enabled: boolean;
      enableInPortal: boolean;
      primaryColor: string;
      bubbleShape: string;
      position: string;
      persistHistory: boolean;
      typingDelay: string;
  enable_file_upload?:boolean;
trademark?:boolean;
faqs?: Array<{ question: string }>
process_transcript?:boolean;
    };
    email: {
      enabled: boolean;
      customEmail?:string;
      prefered_mail?:string;
      fromName: string;
      signature: string;
    ignoreDomains?:string[]
    reply_email?:boolean
       agent_provider?: "thunai" | "google" | "office365";
         agent_application_id?: string;
         mail_box_email?: string;
    };
    meeting_agent: {
      enabled: boolean;
      meeting_apply: string;
      multi_select_users?:string[];
    };
  };
     workflow_type?:string;
  
widget: {
    theme: "light" | "dark";
    border_radius: "none" | "4" | "8" | "12";
    widget_position: "left" | "right";
    intial_message: string;
    placeholder: string;
    agentName: string;
    show_beacon: boolean;
display_type?:string;
is_reasoning?:boolean;
primary_color?:string;//header
secondary_color?:string;//bot message
tertiary_color?:string//user message
widget_bg_color?:string;
  selectedIconUrl?: string;
  widget_text?:string;
  name?:string;
  logo?:string;
  bot_text?:string;
  user_text?:string;
  };
  widget_id?:string;
  html?:string;


  throttling_settings :{
            enabled: boolean,
            max_user_block_time: number,  //5 minutes
            max_websocket_request_seconds: number,
            max_count_per_seconds: number,
            websocket_rate_limit_window: number,  // 1 minute window for rate limiting
            max_websocket_requests_per_window: number,  // Max 10 requests per user per window before blocking
        }
}
