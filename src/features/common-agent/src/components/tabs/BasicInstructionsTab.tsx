import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Brain,
  BarChart3,
  Palette,
  Cpu,
  MessageCircle,
  Mic,
  Mail,
  Calendar,
  ChevronDown,
  ChevronRight,
  Play,
  Plus,
  Pause,
  TrendingUp,
  Headphones,
  BookOpen,Search,
  Info,
  ChevronsUpDown
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { AgentData } from "../../types/agent";
import { fetchVoicesData } from "../../services/authService";
import { useLocation } from "react-router-dom";
import { Check } from "lucide-react"; // optional checkmark icon
import { fetchUsers } from "../../services/accountService";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { FAQSection } from "../FAQSection";
import { QuillSignatureEditor } from "../QuillSignatureEditorProps";
import { manageCustomEmail } from "../../services/authService";
import { useToast } from "@/components/ui/use-toast";
import { apiRequest, getTenantId, requestApi } from "../../services/workflow";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
interface BasicInstructionsTabProps {
  data: AgentData;
  onChange: (data: AgentData) => void;
  emailPrefixSaved?: boolean;
}
const FeedToggle = ({ 
  value, 
  onChange, 
  name, 
  showTooltip, 
  setShowTooltip 
}: { 
  value: boolean; 
  onChange: (val: boolean) => void; 
  name: string;
  showTooltip: boolean;
  setShowTooltip: (val: any) => void;
}) => (
  <div className="space-y-3 p-3 border border-grey-50 rounded-lg">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium text-thunai-text-primary">
          Add the conversations to feed ?
        </Label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowTooltip((prev: boolean) => !prev)}
            className="cursor-pointer"
          >
            <Info size={15} className="text-thunai-primary mt-2" />
          </button>

          {showTooltip && (
            <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-80 p-3 text-xs text-white bg-gray-600 rounded-md shadow-lg z-10 text-justify">
              This option adds the AI conversations to the feed and allows any predefined QC analysis to be performed and analysed.
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-600 rotate-45"></div>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center space-x-2">
          <input
            type="radio"
            id={`${name}-yes`}
            name={name}
            checked={value === true}
            onChange={() => onChange(true)}
            className="h-4 w-4 text-thunai-primary focus:ring-thunai-accent-2 cursor-pointer"
          />
          <Label htmlFor={`${name}-yes`} className="text-sm text-thunai-text-primary">
            Yes
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="radio"
            id={`${name}-no`}
            name={name}
            checked={value !== true}
            onChange={() => onChange(false)}
            className="h-4 w-4 text-thunai-primary focus:ring-thunai-accent-2 cursor-pointer"
          />
          <Label htmlFor={`${name}-no`} className="text-sm text-thunai-text-primary">
            No
          </Label>
        </div>
      </div>
    </div>
  </div>
);
export function BasicInstructionsTab({
  data,
  onChange,emailPrefixSaved=false
}: BasicInstructionsTabProps) {
  const [voicesData, setVoicesData] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioInstance, setAudioInstance] = useState<HTMLAudioElement | null>(
    null
  );
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState(""); // Add search state
  const [showTooltip, setShowTooltip] = useState(false);

// Filter users based on search query
const filteredUsers = users.filter((user) =>
  user.username.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
  user.emailid.toLowerCase().includes(userSearchQuery.toLowerCase())
);
const [isVerifying, setIsVerifying] = useState(false);
const [emailVerified, setEmailVerified] = useState(false);
const [showVerifyButton, setShowVerifyButton] = useState(false);
const [isAdding, setIsAdding] = useState(false);
const [emailPrefixError, setEmailPrefixError] = useState("");
const [isEditingPrefix, setIsEditingPrefix] = useState(false);
  const [accounts, setAccounts] = useState<{ email: string; id: string }[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
const [mailboxes, setMailboxes] = useState<{ email: string; id: string; displayName: string }[]>([]);
  const [loadingMailboxes, setLoadingMailboxes] = useState(false);
const [allowedProviders, setAllowedProviders] = useState<string[]>(["thunai"]);

      const tenant_id = getTenantId();

const { toast } = useToast();
useEffect(() => {
  const fetchProviderConfig = async () => {
    try {
      const response = await requestApi(
        'GET',
        `${tenant_id}/oauth2/app/configure/list/?name=google,office365`,
        null,
        'authService'
      );
      
 if (response?.data) {
  const providers = ["thunai"];
  response.data.forEach((app: any) => {
    const fields = app.action_fields;
    const isMailEnabled =
      fields?.enable_mail_read && fields?.enable_mail_send;

    if (["google", "office365"].includes(app.name) && isMailEnabled) {
      providers.push(app.name);
    }
  });

  setAllowedProviders(providers);
}
    } catch (error) {
      console.error("Failed to fetch provider configuration:", error);
    }
  };
  if (tenant_id) fetchProviderConfig();
}, [tenant_id]);

const fetchOAuthAccounts = async (provider: string) => {
    setAccounts([]); 
    setLoadingAccounts(true);
    try {
      const payload = {
        page: { size: 50, page_number: 1 },
        sort: "asc",
        sortby: "created",
        filter: [{ key_name: "name", key_value: provider, operator: "==" }]
      };
      const response = await requestApi(
        'POST', 
        `${tenant_id}/oauth2/app/connected/filter/`, 
        payload, 
        'authService'
      );

      if (response?.data?.data?.[0]) {
        const appData = response.data.data[0];
        const mappedAccounts = appData.application_identities.map((email: string, index: number) => ({
          email: email,
          id: appData.application_ids[index]
        }));
        setAccounts(mappedAccounts);
      } else {
        setAccounts([]);
      }
    } catch (error) {
      console.error("Failed to fetch OAuth accounts:", error);
      // toast({
      //   title: "Error",
      //   description: "Failed to fetch connected accounts",
      //   variant: "destructive",
      // });
    } finally {
      setLoadingAccounts(false);
    }
  };
  const fetchMailboxes = async (applicationId: string, appName: string) => {
    if (!applicationId || !appName) return;
    setLoadingMailboxes(true);
    try {
      const payload = {
        application_id: applicationId,
        app_name: appName
      };
      const response = await requestApi(
        'POST',
        `${tenant_id}/email/mailboxes/filter/`,
        payload,
        'authService'
      );

      if (response?.data?.mailboxes) {
        setMailboxes(response.data.mailboxes);
      } else {
        setMailboxes([]);
      }
    } catch (error) {
      console.error("Failed to fetch mailboxes:", error);
      toast({description: error.response?.data?.message || "Failed to fetch mailboxes", variant: "destructive"});
      setMailboxes([]);
    } finally {
      setLoadingMailboxes(false);
    }
  };

  useEffect(() => {
    const provider = data.interfaces.email.agent_provider;
    if (provider && provider !== "thunai" && data.interfaces.email.enabled) {
      fetchOAuthAccounts(provider);
    }
  }, [data.interfaces.email.agent_provider, data.interfaces.email.enabled]);
     useEffect(() => {
    const appId = data.interfaces.email.agent_application_id;
    const provider = data.interfaces.email.agent_provider;
    if (appId && provider) {
      fetchMailboxes(appId, provider);
    }
  }, [data.interfaces.email.agent_application_id, data.interfaces.email.agent_provider]);
const handleAddCustomEmail = async () => {
  if (!data.interfaces.email.customEmail?.trim()) return;
   setIsAdding(true); 
  try {
    const response = await manageCustomEmail("create_identity", data.interfaces.email.customEmail);
    if (response) {
      setShowVerifyButton(true);
      setEmailVerified(false);
        const successMessage = response?.message || response.data?.message
      toast({
        title: "Success",
        description: successMessage,
      });
    }
  } catch (error) {
    console.error("Failed to add custom email:", error);
     const errorMessage =error?.response?.message || error?.message || error?.response?.data?.message
    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive",
    });
  }finally {
    setIsAdding(false);
  }
};

const handleVerifyCustomEmail = async () => {
  setIsVerifying(true);
  
  try {
    const response = await manageCustomEmail("verify_identity", data.interfaces.email.customEmail);
    
    if (response) {
      setEmailVerified(true);
      setShowVerifyButton(false);
       const successMessage =  response.data?.message ||response.message || "Email verified successfully!";
      toast({
        title: "Success",
        description: successMessage,
      });
    }
  } catch (error) {
    console.error("Failed to verify custom email:", error);
       const errorMessage =  error.response?.data?.message ||error.message || "Failed to verify email. Please try again.";
    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive",
    });
  } finally {
    setIsVerifying(false);
  }
};


  const fetchUserst = async () => {
    setLoadingUsers(true);
    try {
      const payload =  {
        page: {
          size: 100,
          page_number: 1
        },
        sort: "dsc",
        filter: []
      }
      // const response = await fetchUsers(); // Import this from your API service
       const response = await requestApi('POST',`${tenant_id}/users/`,payload,'accountService');
    const result = response
      if (result.status === "success") {
        setUsers(result.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoadingUsers(false);
    }
  };
  // Add this useEffect to fetch users when multi_select_users is selected
  useEffect(() => {
    if (data.interfaces.meeting_agent?.meeting_apply === "multi_select_users") {
      fetchUserst();
    }
  }, [data.interfaces.meeting_agent?.meeting_apply]);
  useEffect(() => {
    const loadVoicesData = async () => {
      setLoading(true);
      try {
        const response = await fetchVoicesData("POST");
        setVoicesData(response.data);
        setLanguages(response.languages);
         if (data.interfaces.voice.enabled) {
        // Set default voice if none selected
        if (!data.interfaces.voice.selectedVoice && response.data.length > 0) {
          updateInterfaceField("voice", "selectedVoice", response.data[0].id);
        }
        // Set default language to English (US) if none selected
        if (!data.interfaces.voice.selectedLanguage || data.interfaces.voice.selectedLanguage.length === 0) {
          updateInterfaceField("voice", "selectedLanguage", ["English (US)"]);
        }
      }
      } catch (error) {
        console.error("Failed to load voices data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadVoicesData();
  }, [data.interfaces.voice.enabled]);
// Add this useEffect to set defaults when voice is enabled
useEffect(() => {
  if (data.interfaces.voice.enabled && voicesData.length > 0) {
    // Set default voice if none selected
    if (!data.interfaces.voice.selectedVoice) {
      updateInterfaceField("voice", "selectedVoice", voicesData[0].id);
    }
    
    // Set default language to English (US) if none selected
    if (!data.interfaces.voice.selectedLanguage || data.interfaces.voice.selectedLanguage.length === 0) {
      updateInterfaceField("voice", "selectedLanguage", ["English (US)"]);
    }
  }
}, [data.interfaces.voice.enabled, voicesData]);

  const handlePlay = () => {
    const selectedVoice = voicesData.find(
      (voice) => voice.id === data.interfaces.voice.selectedVoice
    );

    if (selectedVoice && selectedVoice.preview_url) {
      if (isPlaying && audioInstance) {
        // Stop the currently playing audio
        audioInstance.pause();
        audioInstance.currentTime = 0;
        setIsPlaying(false);
        return;
      }

      const audio = new Audio(selectedVoice.preview_url);

      // Mark as playing
      setIsPlaying(true);
      setAudioInstance(audio);

      // Reset when finished
      audio.addEventListener("ended", () => {
        setIsPlaying(false);
        setAudioInstance(null);
      });

      // Play audio
      audio.play().catch((error) => {
        console.error("Error playing audio:", error);
        setIsPlaying(false);
      });
    }
  };
  const updateField = (field: string, value: any) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  const updateInterfaceField = (
    interfaceType: keyof AgentData["interfaces"],
    field: string,
    value: any
  ) => {
    onChange({
      ...data,
      interfaces: {
        ...data.interfaces,
        [interfaceType]: {
          ...data.interfaces[interfaceType],
          [field]: value,
        },
      },
    });
  };
  const updateToolField = (
    tool: keyof AgentData["tools"],
    enabled: boolean
  ) => {
    onChange({
      ...data,
      tools: {
        ...data.tools,
        [tool]: enabled,
      },
    });
  };

// FAQ functions
const addFAQ = () => {
  const newFAQ = { question: "" };
  const currentFAQs = data.interfaces?.chatbox?.faqs || [];
  updateInterfaceField("chatbox", "faqs", [...currentFAQs, newFAQ]);
};

const updateFAQ = (index: number, question: string) => {
  const currentFAQs = data.interfaces?.chatbox?.faqs || [];
  const updatedFAQs = [...currentFAQs];
  updatedFAQs[index] = { question };
  updateInterfaceField("chatbox", "faqs", updatedFAQs);
};

const removeFAQ = (index: number) => {
  const currentFAQs = data.interfaces?.chatbox?.faqs || [];
  const updatedFAQs = currentFAQs.filter((_, i) => i !== index);
  updateInterfaceField("chatbox", "faqs", updatedFAQs);
};

const initializeDefaultFAQs = () => {
  const defaultFAQs = [
    // { question: "How does Thunai work ?" },
    // { question: "Can you explain the features of Thunai ?" },
    // { question: "How Thunai Integrates with Slack ?" }
  ];
  
  if (!data.interfaces?.chatbox?.faqs || data.interfaces.chatbox.faqs.length === 0) {
    updateInterfaceField("chatbox", "faqs", defaultFAQs);
  }
};

useEffect(() => {
  if (data.interfaces?.chatbox?.enabled) {
    initializeDefaultFAQs();
  }
}, [data.interfaces?.chatbox?.enabled]);


  return (
    <div className="space-y-6">
      {/* Agent Basics Card */}
      <Card className="shadow-soft hover:shadow-medium transition-smooth">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-thunai-text-primary mb-2">
            Agent Basics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-0">
          <div className="space-y-2">
            <Label
              htmlFor="agent-name"
              className="text-sm font-medium text-thunai-text-primary"
            >
              Agent Name
            </Label>
            <Input
              id="agent-name"
              placeholder="Enter agent name"
              value={data.agentName}
              onChange={(e) => updateField("agentName", e.target.value)}
              className="bg-background border-border focus:ring-2 focus:ring-thunai-accent-2 focus:border-thunai-accent-2 transition-smooth"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="agent-description"
              className="text-sm font-medium text-thunai-text-primary"
            >
              Agent Description
            </Label>
            <Textarea
              id="agent-description"
              placeholder="Brief description of what this agent does"
              className="min-h-[80px] bg-background border-border focus:ring-2 focus:ring-thunai-accent-2 focus:border-thunai-accent-2 transition-smooth"
              value={data.agentDescription}
              onChange={(e) => updateField("agentDescription", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="agent-instructions"
              className="text-sm font-medium text-thunai-text-primary"
            >
              Agent Persona
            </Label>
            <Textarea
              id="agent-instructions"
              placeholder="Define the agent’s role, tone, and behaviour…"
              className="min-h-[120px] bg-background border-border focus:ring-2 focus:ring-thunai-accent-2 focus:border-thunai-accent-2 transition-smooth"
              value={data.agentInstructions}
              onChange={(e) => updateField("agentInstructions", e.target.value)}
            />
            <p className="text-xs text-thunai-text-secondary">
              Use clear, detailed instructions to guide your agent's behavior
              and responses.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tools Section */}
      <Card className="shadow-soft hover:shadow-medium transition-smooth">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-thunai-text-primary mb-2">
            Tools
          </CardTitle>
          <p className="text-sm text-thunai-text-secondary">
            Enable tools and capabilities for your agent
          </p>
        </CardHeader>
        <CardContent className="space-y-6 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-background hover:bg-muted/50 transition-smooth">
              <div className="flex items-center gap-3">
                <Brain className="h-5 w-5 text-thunai-accent" />
                <div>
                  <p className="font-medium text-thunai-text-primary">Brain</p>
                  <p className="text-sm text-thunai-text-secondary">
                    Knowledge Base connection
                  </p>
                </div>
              </div>
              <Switch
                className="data-[state=checked]:bg-thunai-primary"
                checked={data.tools.brain}
                onCheckedChange={(checked) => updateToolField("brain", checked)}
              />
            </div>

            {/* <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-background hover:bg-muted/50 transition-smooth">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-5 w-5 text-thunai-accent" />
                <div>
                  <p className="font-medium text-thunai-text-primary">
                    Analytics
                  </p>
                  <p className="text-sm text-thunai-text-secondary">
                    For querying structured data
                  </p>
                </div>
              </div>
              <Switch
                className="data-[state=checked]:bg-thunai-primary"
                checked={data.tools.analytics}
                onCheckedChange={(checked) =>
                  updateToolField("analytics", checked)
                }
              />
            </div> */}

            {/* <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-background hover:bg-muted/50 transition-smooth">
              <div className="flex items-center gap-3">
                <Palette className="h-5 w-5 text-thunai-accent" />
                <div>
                  <p className="font-medium text-thunai-text-primary">Canvas</p>
                  <p className="text-sm text-thunai-text-secondary">
                    For writing articles, proposals, etc.
                  </p>
                </div>
              </div>
              <Switch
                className="data-[state=checked]:bg-thunai-primary"
                checked={data.tools.canvas}
                onCheckedChange={(checked) =>
                  updateToolField("canvas", checked)
                }
              />
            </div> */}

            <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-background hover:bg-muted/50 transition-smooth">
              <div className="flex items-center gap-3">
                <Cpu className="h-5 w-5 text-thunai-accent" />
                <div>
                  <p className="font-medium text-thunai-text-primary">MCP</p>
                  <p className="text-sm text-thunai-text-secondary">
                    Model Context Protocol integrations
                  </p>
                </div>
              </div>
              <Switch
                className="data-[state=checked]:bg-thunai-primary"
                checked={data.tools.mcp}
                onCheckedChange={(checked) => updateToolField("mcp", checked)}
              />
            </div>
                   <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-background hover:bg-muted/50 transition-smooth">
  <div className="flex items-center gap-3">
    <Search className="h-5 w-5 text-thunai-accent" />
    <div>
      <p className="font-medium text-thunai-text-primary">Web Search</p>
      <p className="text-sm text-thunai-text-secondary">
        Search the web for real-time information
      </p>
    </div>
  </div>
  <Switch
    className="data-[state=checked]:bg-thunai-primary"
    checked={data.tools.web_search}
    onCheckedChange={(checked) => updateToolField("web_search", checked)}
  />
</div>
          </div>
        </CardContent>
      </Card>

      {/* Interfaces Section */}
      <Card className="shadow-soft hover:shadow-medium transition-smooth">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-thunai-text-primary mb-2">
            Interfaces
          </CardTitle>
          <p className="text-sm text-thunai-text-secondary">
            Choose how users can interact with your agent
          </p>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          {/* Voice Interface */}
          <Card className="bg-background border border-muted shadow-sm rounded-xl">
            <Collapsible
              open={data.interfaces.voice.enabled}
              onOpenChange={(open) =>
                updateInterfaceField("voice", "enabled", open)
              }
            >
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between p-4 hover:bg-muted/30 transition-smooth cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Mic className="h-5 w-5 text-thunai-accent" />
                    <div>
                      <p className="font-medium text-thunai-text-primary">
                        Voice
                      </p>
                      <p className="text-sm text-thunai-text-secondary">
                        Speech recognition & synthesis
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={data.interfaces.voice.enabled}
                      onCheckedChange={(checked) =>
                        updateInterfaceField("voice", "enabled", checked)
                      }
                      className="data-[state=checked]:bg-thunai-primary"
                    />
                    {data.interfaces.voice.enabled ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </div>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="px-4 pb-4">
                <div className="pt-4 border-t border-muted space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-thunai-text-primary">
                        Voice Selection
                      </Label>
                      {/* <Select>
                        <SelectTrigger className="bg-background border-muted focus:ring-thunai-accent-2">
                          <SelectValue placeholder="Select voice" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="natural-male">Natural Male</SelectItem>
                          <SelectItem value="natural-female">Natural Female</SelectItem>
                          <SelectItem value="neutral">Neutral</SelectItem>
                          <SelectItem value="professional">Professional</SelectItem>
                        </SelectContent>
                      </Select> */}
                      <Select
                        value={data.interfaces.voice.selectedVoice || ""}
                        onValueChange={(value) =>
                          updateInterfaceField("voice", "selectedVoice", value)
                        }
                        disabled={loading}
                      >
                        <SelectTrigger className="bg-background border-muted focus:ring-thunai-accent-2">
                          <SelectValue
                            placeholder={
                              loading ? "Loading voices..." : "Select voice"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {voicesData.map((voice) => (
                            <SelectItem key={voice.id} value={voice.id}>
                              {voice.name} ({voice.labels.gender},
                              {voice.labels.accent})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* <div className="space-y-2">
                      <Label className="text-sm font-medium text-thunai-text-primary">
                        Languages
                      </Label>
                      <Select
                        value=""
                        onValueChange={() => {}} // required, but unused here
                        disabled={loading}
                      >
                        <SelectTrigger className="bg-background border-muted focus:ring-thunai-accent-2">
                          <SelectValue
                            placeholder={
                              loading
                                ? "Loading languages..."
                                : data.interfaces.voice.selectedLanguage &&
                                  data.interfaces.voice.selectedLanguage
                                    .length > 0
                                ? Array.isArray(
                                    data.interfaces.voice.selectedLanguage
                                  )
                                  ? data.interfaces.voice.selectedLanguage.join(
                                      ", "
                                    )
                                  : data.interfaces.voice.selectedLanguage
                                : "Select languages"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {languages.map((language) => {
                            const isSelected =
                              data.interfaces.voice.selectedLanguage?.includes(
                                language
                              );
                            return (
                              <div
                                key={language}
                                className={cn(
                                  "flex items-center justify-between px-2 py-1.5 cursor-pointer rounded-md",
                                  isSelected && "bg-thunai-accent-2/10"
                                )}
                                onClick={() => {
                                  const current =
                                    data.interfaces.voice.selectedLanguage ||
                                    [];
                                  const updated = isSelected
                                    ? current.filter((l) => l !== language)
                                    : [...current, language];
                                  updateInterfaceField(
                                    "voice",
                                    "selectedLanguage",
                                    updated
                                  );
                                }}
                              >
                                <span>{language}</span>
                                {isSelected && (
                                  <Check className="h-4 w-4 text-thunai-accent-2" />
                                )}
                              </div>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div> */}
<div className="space-y-2">
  <Label className="text-sm font-medium text-thunai-text-primary">
    Languages
  </Label>

  <Popover>
<PopoverTrigger asChild>
  <Button
    variant="outline"
    role="combobox"
    disabled={loading}
     className="
      w-full 
      justify-between 
      text-thunai-text-primary
      hover:bg-transparent 
      hover:text-thunai-text-primary
      focus:bg-transparent 
      focus:text-thunai-text-primary
      active:bg-transparent
    "
  
  >
    <span className="truncate text-left">
      {data.interfaces.voice.selectedLanguage || "Select languages"}
    </span>

    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
  </Button>
</PopoverTrigger>

    <PopoverContent 
  align="start"
  className="w-[--radix-popover-trigger-width] p-0"
>
      <Command>
        {/* 🔍 Search input */}
        <CommandInput placeholder="Search language..." />

        <CommandEmpty>No language found.</CommandEmpty>

        <CommandGroup className="max-h-60 overflow-y-auto">
          {languages.map((language) => {
            const selected = data.interfaces.voice.selectedLanguage;

const selectedArray =
  typeof selected === "string"
    ? selected.split(",").map((l) => l.trim()).filter((l) => l.length > 0)
    : Array.isArray(selected)
    ? selected
    : [];

        const isSelected = selectedArray.includes(language);

            return (
              <CommandItem
                key={language}
                onSelect={() => {
                  let updatedArray;

                  if (isSelected) {
                    updatedArray = selectedArray.filter((l) => l !== language);
                  } else {
                    updatedArray = [...selectedArray, language];
                  }

                  const updatedString = updatedArray.join(", ");
                  updateInterfaceField("voice", "selectedLanguage", updatedString);
                }}
              >
                <Check
                  className={`mr-2 h-4 w-4 ${
                    isSelected ? "opacity-100" : "opacity-0"
                  }`}
                />
                {language}
              </CommandItem>
            );
          })}
        </CommandGroup>
      </Command>
    </PopoverContent>
  </Popover>
</div>


                  </div>
                  {/* <div className="space-y-3 p-3 border border-grey-50 rounded-lg">
  <div className="flex items-center justify-between">
    <Label className="text-sm font-medium text-thunai-text-primary">
      Add to Feed
    </Label>
    <Switch
      checked={data.interfaces.voice.process_transcript || false}
      onCheckedChange={(checked) =>
        updateInterfaceField("voice", "process_transcript", checked)
      }
      className="data-[state=checked]:bg-thunai-primary"
    />
  </div>
</div> */}
 <FeedToggle 
      name="voiceFeed"
      value={data.interfaces.voice.process_transcript}
      onChange={(val) => updateInterfaceField("voice", "process_transcript", val)}
      showTooltip={showTooltip}
      setShowTooltip={setShowTooltip}
    />
<div className="space-y-3 p-3 border border-grey-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-thunai-text-primary">
                       Sentiment Analysis
                      </Label>
                      <Switch
                        checked={
                          data.interfaces.voice.sentiment_suggestion || false
                        }
                        onCheckedChange={(checked) =>
                          updateInterfaceField(
                            "voice",
                            "sentiment_suggestion",
                            checked
                          )
                        }
                        className="data-[state=checked]:bg-thunai-primary"
                      />
                    </div>
                  </div>
                  {/* Screen Share Section */}
                  <div className="space-y-3 p-3 border border-grey-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-thunai-text-primary">
                        Enable Screen Share
                      </Label>
                      <Switch
                        checked={
                          data.interfaces.voice.enableScreenShare || false
                        }
                        onCheckedChange={(checked) =>
                          updateInterfaceField(
                            "voice",
                            "enableScreenShare",
                            checked
                          )
                        }
                        className="data-[state=checked]:bg-thunai-primary"
                      />
                    </div>
                  </div>

                  {/* Duration Limit Section */}
                  <div className="space-y-3 p-3 border border-grey-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-thunai-text-primary">
                        Enable Duration Limit
                      </Label>
                      <Switch
                        checked={
                          data.interfaces.voice.enableDurationLimit || false
                        }
                        onCheckedChange={(checked) =>
                          updateInterfaceField(
                            "voice",
                            "enableDurationLimit",
                            checked
                          )
                        }
                        className="data-[state=checked]:bg-thunai-primary"
                      />
                    </div>

                    {/* Agent Duration - Only show when Duration Limit is enabled */}
                    {data.interfaces.voice.enableDurationLimit && (
                      <div className="space-y-2 pl-4 border-l-2 border-muted">
                        <Label className="text-sm font-medium text-thunai-text-primary">
                          Agent Duration
                        </Label>
                        <p className="text-xs text-thunai-text-secondary">
                          Set how long the voice agent can be used (in minutes)
                        </p>
                        <Input
                          type="number"
                          placeholder="Enter duration in minutes"
                          value={data.interfaces.voice.agentDuration || ""}
                          onChange={(e) =>
                            updateInterfaceField(
                              "voice",
                              "agentDuration",
                              e.target.value
                            )
                          }
                          className="bg-background border-muted focus:ring-thunai-accent-2"
                        />
                      </div>
                    )}
                  </div>
                  {/* Store Conversation Audio Section */}
                  <div className="space-y-3 p-3 border border-grey-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-thunai-text-primary">
                        Store Conversation Audio
                      </Label>
                      <Switch
                        checked={
                          data.interfaces.voice.storeConversationAudio || false
                        }
                        onCheckedChange={(checked) =>
                          updateInterfaceField(
                            "voice",
                            "storeConversationAudio",
                            checked
                          )
                        }
                        className="data-[state=checked]:bg-thunai-primary"
                      />
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="bg-background border-muted"
                    onClick={handlePlay}

                    // disabled={!data.interfaces.voice.selectedVoice || loading}
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="h-4 w-4 mr-2" />
                        Stop
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Preview Voice
                      </>
                    )}
                  </Button>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Chat Interface */}
          <Card className="bg-background border border-muted shadow-sm rounded-xl">
            <Collapsible
              open={data.interfaces.chatbox.enabled}
              onOpenChange={(open) =>
                updateInterfaceField("chatbox", "enabled", open)
              }
            >
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between p-4 hover:bg-muted/30 transition-smooth cursor-pointer">
                  <div className="flex items-center gap-3">
                    <MessageCircle className="h-5 w-5 text-thunai-accent" />
                    <div>
                      <p className="font-medium text-thunai-text-primary">
                        Chat
                      </p>
                      <p className="text-sm text-thunai-text-secondary">
                        Text-based conversations
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={data.interfaces.chatbox.enabled}
                      onCheckedChange={(checked) =>
                        updateInterfaceField("chatbox", "enabled", checked)
                      }
                      className="data-[state=checked]:bg-thunai-primary"
                    />
                    {data.interfaces.chatbox.enabled ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </div>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="px-4 pb-4">
              {/* Throttling Settings Section - Inside Chat Interface Collapsible */}
<div className="pt-4 border-t border-muted space-y-4">
  <div className="flex items-center justify-between p-3 border border-grey-50 rounded-lg">
    <div className="space-y-0.5">
      <Label className="text-sm font-medium text-thunai-text-primary">
        Enable Throttling
      </Label>
      <p className="text-xs text-thunai-text-secondary">
        Control request frequency and prevent message flooding
      </p>
    </div>
    <Switch
      className="data-[state=checked]:bg-thunai-primary"
      checked={data.throttling_settings?.enabled || false}
      onCheckedChange={(checked) =>
        onChange({
          ...data,
          throttling_settings: {
            ...data.throttling_settings,
            enabled: checked,
          },
        })
      }
    />
  </div>

  {data.throttling_settings?.enabled && (
    <div className="space-y-6 p-4 bg-muted/20 rounded-lg border border-muted animate-in fade-in duration-300">
      <div className="space-y-2">
        <Label className="text-xs font-semibold text-thunai-text-primary">
          Max User Block Time (seconds)
        </Label>
        <Input
          type="number"
          min={0}
          placeholder="Eg.300"
          value={data.throttling_settings.max_user_block_time || ""}
          onChange={(e) =>
            onChange({
              ...data,
              throttling_settings: {
                ...data.throttling_settings,
                max_user_block_time: Number(e.target.value),
              },
            })
          }
          className="bg-background border-muted focus:ring-thunai-accent-2"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Burst Limits (Correlated) */}
        <div className="space-y-4 p-3 border border-dashed border-thunai-accent/30 rounded-md">
          <div className="space-y-2">
            <Label className="text-xs text-thunai-text-secondary">
            Socket Rate Limit Window (seconds)
            </Label>
            <Input
              type="number"
              min={0}
              placeholder="Eg.60"
              value={data.throttling_settings.websocket_rate_limit_window || ""}
              onChange={(e) =>
                onChange({
                  ...data,
                  throttling_settings: {
                    ...data.throttling_settings,
                    websocket_rate_limit_window: Number(e.target.value),
                  },
                })
              }
              className="bg-background border-muted"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-thunai-text-secondary">
              Max Socket Request (seconds)
            </Label>
            <Input
              type="number"
              min={0}
              placeholder="Eg.10"
              value={data.throttling_settings.max_websocket_request_seconds || ""}
              onChange={(e) =>
                onChange({
                  ...data,
                  throttling_settings: {
                    ...data.throttling_settings,
                    max_websocket_request_seconds: Number(e.target.value),
                  },
                })
              }
              className="bg-background border-muted"
            />
          </div>
        
        </div>

        {/* Window Limits (Correlated) */}
        <div className="space-y-4 p-3 border border-dashed border-thunai-accent/30 rounded-md">
      
          <div className="space-y-2">
            <Label className="text-xs text-thunai-text-secondary">
              Max Socket Requests per Window
            </Label>
            <Input
              type="number"
              min={0}
              placeholder="Eg.10"
              value={data.throttling_settings.max_websocket_requests_per_window || ""}
              onChange={(e) =>
                onChange({
                  ...data,
                  throttling_settings: {
                    ...data.throttling_settings,
                    max_websocket_requests_per_window: Number(e.target.value),
                  },
                })
              }
              className="bg-background border-muted"
            />
          </div>
            <div className="space-y-2">
            <Label className="text-xs text-thunai-text-secondary">
              Max Count per Seconds
            </Label>
            <Input
              type="number"
              min={0}
              placeholder="Eg.3"
              value={data.throttling_settings.max_count_per_seconds || ""}
              onChange={(e) =>
                onChange({
                  ...data,
                  throttling_settings: {
                    ...data.throttling_settings,
                    max_count_per_seconds: Number(e.target.value),
                  },
                })
              }
              className="bg-background border-muted"
            />
          </div>
        </div>
      </div>
    </div>
  )}
</div>

                <div className="pt-4 border-t border-muted space-y-4">
              <div className="grid grid-cols-2 gap-4 ">
  <div className="flex items-center justify-between border border-grey-50 rounded-lg p-3">
    <Label className="text-sm font-medium text-thunai-text-primary">
      Enable reasoning
    </Label>
    <Switch 
      className="data-[state=checked]:bg-thunai-primary"  
      checked={data.widget.is_reasoning || false}
      onCheckedChange={(checked) => {
        onChange({
          ...data,
          widget: {
            ...data.widget,
            is_reasoning: checked,
          },
        });
      }}
    />
  </div>
   <div className="flex items-center justify-between p-3 rounded-lg border border-grey">
              <div className="flex items-center gap-3">
                <div>
                  <Label className="text-sm font-medium text-thunai-text-primary">
                    Canvas
                  </Label>
                  {/* <p className="text-xs text-thunai-text-secondary">
                    For writing articles, proposals, etc.
                  </p> */}
                </div>
              </div>
              <Switch
                className="data-[state=checked]:bg-thunai-primary"
                checked={data.tools.canvas}
                onCheckedChange={(checked) =>
                  updateToolField("canvas", checked)
                }
              />
            </div>
                  <div className="flex items-center justify-between border border-grey-50 rounded-lg p-3">
                    <Label className="text-sm font-medium text-thunai-text-primary">
                      Enable File Upload
                    </Label>
                    <Switch className="data-[state=checked]:bg-thunai-primary"  checked={data.interfaces.chatbox.enable_file_upload}
                      onCheckedChange={(checked) =>
                        updateInterfaceField("chatbox", "enable_file_upload", checked)
                      }/>
                  </div>
 <div className="flex items-center justify-between border border-grey-50 rounded-lg p-3">
                    <Label className="text-sm font-medium text-thunai-text-primary">     
Show Thunai trademark on widget
                    </Label>
                    <Switch className="data-[state=checked]:bg-thunai-primary"  checked={data.interfaces.chatbox.trademark}
                      onCheckedChange={(checked) =>
                        updateInterfaceField("chatbox", "trademark", checked)
                      }/>
                  </div>
</div>

        {/* Add the conversations to feed section for Chat */}
       <FeedToggle 
      name="chatFeed"
      value={data.interfaces.chatbox.process_transcript}
      onChange={(val) => updateInterfaceField("chatbox", "process_transcript", val)}
      showTooltip={showTooltip}
      setShowTooltip={setShowTooltip}
    />


                  <div className="space-y-3">
                      <div className="space-y-2">
                        <Label className="text-xs text-thunai-text-secondary">
                          Bubble Shape
                        </Label>
                        <Select
                          value={data.interfaces.chatbox?.bubbleShape || "round"}
                      onValueChange={(value) =>
                        updateInterfaceField(
                          "chatbox",
                          "bubbleShape",
                          value
                        )
                      }>
                          <SelectTrigger className="bg-background border-muted">
                            <SelectValue placeholder="Rounded" />
                          </SelectTrigger>
                          <SelectContent className="z-[10]">
                            <SelectItem value="round">Rounded</SelectItem>
                            <SelectItem value="square">Square</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    
                  </div>
           <div className="space-y-3">
      <Label>Welcome Message</Label>

      <Textarea
        rows={3}
        value={data.widget.intial_message || ""}
        onChange={(e) => {
          onChange({
            ...data,
            widget: {
              ...data.widget,
              intial_message: e.target.value,
            },
          });
        }}
        placeholder="Hi! How can I help you today?"
        className="bg-background border-border focus:ring-2 focus:ring-thunai-accent-2 focus:border-thunai-accent-2 transition-smooth"
      />
    </div>
                </div>
                <FAQSection
  faqs={data.interfaces?.chatbox?.faqs || []}
  onAddFAQ={addFAQ}
  onUpdateFAQ={updateFAQ}
  onRemoveFAQ={removeFAQ}
/>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Email Interface */}
               <Card className="bg-background border border-muted shadow-sm rounded-xl">
        <Collapsible
          open={data.interfaces.email.enabled}
          onOpenChange={(open) => updateInterfaceField("email", "enabled", open)}
        >
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between p-4 hover:bg-muted/30 transition-smooth cursor-pointer">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-thunai-accent" />
                <div>
                  <p className="font-medium text-thunai-text-primary">Email</p>
                  <p className="text-sm text-thunai-text-secondary">Email-based interactions</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={data.interfaces.email.enabled}
                  onCheckedChange={(checked) => updateInterfaceField("email", "enabled", checked)}
                  className="data-[state=checked]:bg-thunai-primary"
                />
                {data.interfaces.email.enabled ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </div>
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="px-4 pb-4">
            <div className="pt-4 border-t border-muted space-y-4">
              
              {/* Agent Provider Dropdown */}
 <div className="space-y-2">
   <Label className="text-xs text-thunai-text-secondary">Agent Provider</Label>
<Select
  value={data.interfaces.email.agent_provider || "thunai"}
  onValueChange={(value) => {
    // Perform both updates in one go to prevent the second call from overwriting the first
    onChange({
      ...data,
      interfaces: {
        ...data.interfaces,
        email: {
          ...data.interfaces.email,
          agent_provider: value as "thunai" | "google" | "office365",
          agent_application_id: "",
          prefered_mail: "",
        }
      }
    });
  }}
>
  <SelectTrigger className="bg-background border-muted focus:ring-thunai-accent-2">
    <SelectValue placeholder="Select Provider" />
  </SelectTrigger>
 <SelectContent className="z-[50]">
  {allowedProviders.includes("thunai") && (
    <SelectItem value="thunai">Thunai</SelectItem>
  )}
  {allowedProviders.includes("google") && (
    <SelectItem value="google">Google</SelectItem>
  )}
  {allowedProviders.includes("office365") && (
    <SelectItem value="office365">Office 365</SelectItem>
  )}
</SelectContent>

</Select>
</div>


              {/* Conditional Rendering based on Provider */}
              {(data.interfaces.email.agent_provider === "thunai" || !data.interfaces.email.agent_provider) ? (
                <>
        <div className="flex-1 space-y-3">
      <Label className="text-xs text-thunai-text-secondary">
        Mail ID Prefix <span className="text-red-500">*</span>
      </Label>
      <Input
        value={data.interfaces.email.prefered_mail || ""}
        onChange={(e) => {
          updateInterfaceField("email", "prefered_mail", e.target.value.toLowerCase());
          // Clear error when user starts typing
          if (emailPrefixError) setEmailPrefixError("");
        }}
        onFocus={() => {
          // Check if there's already data AND it's been saved, if so, don't allow editing
          if (data.interfaces.email.prefered_mail && 
              data.interfaces.email.prefered_mail.trim() && 
              emailPrefixSaved) {
            setIsEditingPrefix(false);
          } else {
            setIsEditingPrefix(true);
          }
        }}
        onBlur={(e) => {
          // Validate on blur
          if (!e.target.value.trim()) {
            setEmailPrefixError("Mail ID prefix is required");
          }
          setIsEditingPrefix(false);
        }}
        placeholder="e.g., bugreports"
        readOnly={data.interfaces.email.prefered_mail && 
                  data.interfaces.email.prefered_mail.trim() && 
                  emailPrefixSaved && 
                  !isEditingPrefix}
        style={{
          cursor: data.interfaces.email.prefered_mail && 
                  data.interfaces.email.prefered_mail.trim() && 
                  emailPrefixSaved && 
                  !isEditingPrefix ? 'not-allowed' : 'text'
        }}
        className={`bg-background border-muted focus:ring-thunai-accent-2 ${
          emailPrefixError ? "border-red-500" : ""
        }`}
        required
      />
      {emailPrefixError && (
        <p className="text-xs text-red-500">{emailPrefixError}</p>
      )}
    </div>

        <div className="space-y-2">
          <Label className="text-xs text-thunai-text-secondary">
            Preview Mailbox ID:
          </Label>
          <div className="p-3 bg-muted/30 rounded-md border border-muted">
            <span className="text-sm text-thunai-text-primary">
              {data.interfaces.email.prefered_mail}@thunai.app
            </span>
          </div>
        </div>

        <div className="space-y-2">
                  {/* Custom Email Management Section */}
                   <Label className="text-xs text-thunai-text-secondary">
      Custom Email
    </Label>
<div className="flex items-center gap-2">
  <div className="flex-1">
   
    <Input
      value={data.interfaces.email.customEmail}
      onChange={(e) =>
        updateInterfaceField(
          "email",
          "customEmail",
          e.target.value
        )
      }
      placeholder="test@gmail.com"
      className="bg-background border-muted focus:ring-thunai-accent-2"
    />
  </div>
  <div className="flex gap-2 items-end">
    {/* Show Add button only when verify button is not shown and email is not verified */}
    {!showVerifyButton && !emailVerified && (
      <Button
        onClick={handleAddCustomEmail}
        variant="outline"
        size="sm"
        disabled={!data.interfaces.email.customEmail?.trim()}
        className="shrink-0"
      >
        <Plus className="h-4 w-4 mr-1" />
      {isAdding ? "Adding..." : "Add"}
      </Button>
    )}
    
    {/* Show Verify button only when showVerifyButton is true and email is not verified */}
    {showVerifyButton && !emailVerified && (
      <Button
        onClick={handleVerifyCustomEmail}
        variant="outline"
        size="sm"
        disabled={isVerifying}
        className="shrink-0"
      >
        {isVerifying ? "Verifying..." : "Verify"}
      </Button>
    )}
    
    {/* Show verified status */}
    {emailVerified && (
      <div className="flex items-center gap-1 text-green-600 text-sm">
        <Check className="h-4 w-4" />
        Verified
      </div>
    )}
      </div>
                    </div>
       </div>
                </>
              ) : (
                <>
                <div className="space-y-2">
                  <Label className="text-xs text-thunai-text-secondary">Select Account</Label>
                  <Select
                    value={data.interfaces.email.agent_application_id || ""}
                    onValueChange={(value) => updateInterfaceField("email", "agent_application_id", value)}
                    disabled={loadingAccounts}
                  >
                    <SelectTrigger className="bg-background border-muted focus:ring-thunai-accent-2">
                      <SelectValue placeholder={loadingAccounts ? "Loading accounts..." : "Choose an account"} />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.length > 0 ? (
                        accounts.map((acc) => (
                          <SelectItem key={acc.id} value={acc.id}>
                            {acc.email}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-2 text-xs text-center text-thunai-text-secondary">No accounts connected</div>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
             {data.interfaces.email.agent_application_id && (
  <div className="space-y-2">
    <Label className="text-xs text-thunai-text-secondary">Mailbox</Label>
    <Select
      value={data.interfaces.email.mail_box_email || ""}
      onValueChange={(value) => updateInterfaceField("email", "mail_box_email", value)}
      disabled={loadingMailboxes}
    >
      <SelectTrigger className="bg-background border-muted">
        <SelectValue placeholder={loadingMailboxes ? "Loading mailboxes..." : "Choose a mailbox"} />
      </SelectTrigger>
      <SelectContent>
        {mailboxes.length > 0 ? (
          mailboxes.map((mb, idx) => (
            <SelectItem key={idx} value={mb.email}>
              {mb.email} {mb.displayName ? `(${mb.displayName})` : ''}
            </SelectItem>
          ))
        ) : (
          <div className="p-2 text-xs text-center text-thunai-text-secondary">
            {loadingMailboxes ? "Fetching mailboxes..." : "No mailboxes available"}
          </div>
        )}
      </SelectContent>
    </Select>
  </div>
)}

                      </>
              )}

              {/* Signature and Exclude Domains remain visible for all providers */}
                  <div className="space-y-3">
                  
                    <div className=" md:grid-cols-2 gap-4">
                      
                      <div className="space-y-2">
                        <Label className="text-xs text-thunai-text-secondary">
                           Signature
                        </Label>
                        <QuillSignatureEditor
  value={data.interfaces.email.signature || ""}
  onChange={(value) =>
    updateInterfaceField("email", "signature", value)
  }
  placeholder="Best regards,&#10;Your Agent"
/>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-thunai-text-secondary">
                        Exclude Domains
                      </Label>
                      <Input
                        value={data.interfaces.email.ignoreDomains || ""}
                        onChange={(e) => {
                          updateInterfaceField(
                            "email",
                            "ignoreDomains",
                            e.target.value
                          );
                        }}
                        onBlur={(e) => {
                          // when input loses focus, convert string → array
                          const domains = e.target.value
                            .split(",")
                            .map((d) => d.trim())
                            .filter(Boolean);
                          updateInterfaceField(
                            "email",
                            "ignoreDomains",
                            domains
                          );
                        }}
                        placeholder="example.com, spam-domain.com"
                        className="bg-background border-muted focus:ring-thunai-accent-2"
                      />
                      <p className="text-xs text-thunai-text-secondary">
                        Comma-separated list of domains to exclude from
                        auto-replies
                      </p>
                    </div>
                  </div>
  <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
  {/* Left content */}
  <div className="space-y-1">
    <Label className="text-sm font-medium text-thunai-text-primary">
      Enable Agent Auto-reply
    </Label>
    <p className="text-xs text-thunai-text-secondary">
      If enabled, the agent will automatically draft and send replies to incoming emails.
    </p>
  </div>

  {/* Right switch */}
  <Switch
  checked={data.interfaces.email.reply_email ?? true}
    onCheckedChange={(checked) =>
      updateInterfaceField("email", "reply_email", checked)
    }
    className="data-[state=checked]:bg-thunai-primary"
  />
</div>

                </div>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Meetings Interface */}
          <Card className="bg-background border border-muted shadow-sm rounded-xl">
            <Collapsible
              open={data.interfaces.meeting_agent?.enabled}
              onOpenChange={(open) =>
                updateInterfaceField("meeting_agent", "enabled", open)
              }
            >
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between p-4 hover:bg-muted/30 transition-smooth cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-thunai-accent" />
                    <div>
                      <p className="font-medium text-thunai-text-primary">
                        Meetings
                      </p>
                      <p className="text-sm text-thunai-text-secondary">
                        Calendar & meeting management
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={data.interfaces.meeting_agent?.enabled}
                      onCheckedChange={(checked) =>
                        updateInterfaceField(
                          "meeting_agent",
                          "enabled",
                          checked
                        )
                      }
                      className="data-[state=checked]:bg-thunai-primary"
                    />
                    {data.interfaces.meeting_agent?.enabled ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </div>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="px-4 pb-4">
                <div className="pt-4 border-t border-muted space-y-4">
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-thunai-text-primary">
                      Apply To
                    </Label>
                    <Select
                      value={data.interfaces.meeting_agent?.meeting_apply || ""}
                      onValueChange={(value) =>
                        updateInterfaceField(
                          "meeting_agent",
                          "meeting_apply",
                          value
                        )
                      }
                    >
                      <SelectTrigger className="bg-background border-muted focus:ring-thunai-accent-2">
                        <SelectValue placeholder="Choose who this agent will be active for" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="you_only">
                          You only (agent joins only your meetings)
                        </SelectItem>
                        <SelectItem value="everyone">
                          Everyone (agent joins all organization meetings)
                        </SelectItem>
                        <SelectItem value="multi_select_users">
                          Multi-select users (choose specific people)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Multi-select users dropdown - only show when multi_select_users is selected */}
                  {/* {data.interfaces.meeting_agent?.meeting_apply ===
                    "multi_select_users" && (
                    <div className="space-y-3 p-3 border border-grey-50 rounded-lg">
                      <Label className="text-sm font-medium text-thunai-text-primary">
                        Select Users
                      </Label>
                      <Select
                        value=""
                        onValueChange={() => {}} // required, but unused here
                        disabled={loadingUsers}
                      >
                        <SelectTrigger className="bg-background border-muted focus:ring-thunai-accent-2">
                          <SelectValue
                            placeholder={
                              loadingUsers
                                ? "Loading users..."
                                : data.interfaces.meeting_agent
                                    ?.multi_select_users &&
                                  data.interfaces.meeting_agent
                                    .multi_select_users.length > 0
                                ? data.interfaces.meeting_agent.multi_select_users
                                    .map(
                                      (userId) =>
                                        users.find(
                                          (user) => user.user_id === userId
                                        )?.username
                                    )
                                    .filter(Boolean)
                                    .join(", ")
                                : "Select users"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {users.map((user) => {
                            const isSelected =
                              data.interfaces.meeting_agent?.multi_select_users?.includes(
                                user.user_id
                              );
                            return (
                              <div
                                key={user.user_id}
                                className={cn(
                                  "flex items-center justify-between px-2 py-1.5 cursor-pointer rounded-md hover:bg-muted/50",
                                  isSelected && "bg-thunai-accent-2/10"
                                )}
                                onClick={() => {
                                  const current =
                                    data.interfaces.meeting_agent
                                      ?.multi_select_users || [];
                                  const updated = isSelected
                                    ? current.filter(
                                        (id) => id !== user.user_id
                                      )
                                    : [...current, user.user_id];
                                  updateInterfaceField(
                                    "meeting_agent",
                                    "multi_select_users",
                                    updated
                                  );
                                }}
                              >
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium">
                                    {user.username}
                                  </span>
                                  <span className="text-xs text-thunai-text-secondary">
                                    {user.emailid}
                                  </span>
                                </div>
                                {isSelected && (
                                  <Check className="h-4 w-4 text-thunai-accent-2" />
                                )}
                              </div>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      {data.interfaces.meeting_agent?.multi_select_users &&
                        data.interfaces.meeting_agent.multi_select_users
                          .length > 0 && (
                          <div className="text-xs text-thunai-text-secondary">
                            Selected:{" "}
                            {
                              data.interfaces.meeting_agent.multi_select_users
                                .length
                            }{" "}
                            user(s)
                          </div>
                        )}
                    </div>
                  )} */}
                  {/* Multi-select users dropdown - only show when multi_select_users is selected */}
{/* Multi-select users dropdown - only show when multi_select_users is selected */}
{data.interfaces.meeting_agent?.meeting_apply ===
  "multi_select_users" && (
  <div className="space-y-3 p-3 border border-grey-50 rounded-lg">
    <Label className="text-sm font-medium text-thunai-text-primary">
      Select Users
    </Label>
    
    <Select
      value=""
      onValueChange={() => {}} // required, but unused here
      disabled={loadingUsers}
    >
      <SelectTrigger className="bg-background border-muted focus:ring-thunai-accent-2">
        <SelectValue
          placeholder={
            loadingUsers
              ? "Loading users..."
              : data.interfaces.meeting_agent
                  ?.multi_select_users &&
                data.interfaces.meeting_agent
                  .multi_select_users.length > 0
              ? data.interfaces.meeting_agent.multi_select_users
                  .map(
                    (userId) =>
                      users.find(
                        (user) => user.user_id === userId
                      )?.username
                  )
                  .filter(Boolean)
                  .join(", ")
              : "Select users"
          }
        />
      </SelectTrigger>
      <SelectContent>
        {/* Search Input Inside Dropdown */}
        <div className="p-2 border-b border-muted">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-thunai-text-secondary" />
            <Input
              placeholder="Search users..."
              value={userSearchQuery}
              onChange={(e) => setUserSearchQuery(e.target.value)}
              className="pl-10 h-8 bg-background border-muted focus:ring-thunai-accent-2"
              onClick={(e) => e.stopPropagation()} // Prevent dropdown from closing
            />
          </div>
        </div>
        
        {/* Users List */}
        <div className="max-h-48 overflow-y-auto">
          {filteredUsers.length === 0 ? (
            <div className="px-2 py-1.5 text-sm text-thunai-text-secondary">
              {userSearchQuery ? "No users found matching your search" : "No users available"}
            </div>
          ) : (
            filteredUsers.map((user) => {
              const isSelected =
                data.interfaces.meeting_agent?.multi_select_users?.includes(
                  user.user_id
                );
              return (
                <div
                  key={user.user_id}
                  className={cn(
                    "flex items-center justify-between px-2 py-1.5 cursor-pointer rounded-md hover:bg-muted/50",
                    isSelected && "bg-thunai-accent-2/10"
                  )}
                  onClick={() => {
                    const current =
                      data.interfaces.meeting_agent
                        ?.multi_select_users || [];
                    const updated = isSelected
                      ? current.filter(
                          (id) => id !== user.user_id
                        )
                      : [...current, user.user_id];
                    updateInterfaceField(
                      "meeting_agent",
                      "multi_select_users",
                      updated
                    );
                  }}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {user.username}
                    </span>
                    <span className="text-xs text-thunai-text-secondary">
                      {user.emailid}
                    </span>
                  </div>
                  {isSelected && (
                    <Check className="h-4 w-4 text-thunai-accent-2" />
                  )}
                </div>
              );
            })
          )}
        </div>
      </SelectContent>
    </Select>
    
    {data.interfaces.meeting_agent?.multi_select_users &&
      data.interfaces.meeting_agent.multi_select_users
        .length > 0 && (
        <div className="text-xs text-thunai-text-secondary">
          Selected:{" "}
          {
            data.interfaces.meeting_agent.multi_select_users
              .length
          }{" "}
          user(s)
        </div>
      )}
  </div>
)}


                </div>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
