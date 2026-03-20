import { useState ,useEffect} from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Shield, ShieldCheck, Lock, ChevronDown ,Plus,Trash2} from "lucide-react";
import { useLocation } from 'react-router-dom';
import { fetchSchemaAttributes } from "../../services/accountService";
import { requestApi } from "../../services/workflow";
interface AccessRule {
  attribute: string;
  operator: string;
  value: string;
  ai_instruction: string;
}

interface AccessControlData {
  enableAccessControl: boolean;
  auth_type: string;
  // directory_id: string;
  app_id?: string; // Added app_id for SAML
  access_rules: AccessRule[];
}
interface SecurityTabProps {
  onChange?: (updates: any) => void;
  agentData?: any;
}

export function SecurityTab({ onChange,agentData }: SecurityTabProps) {
  const [restrictTopicsEnabled, setRestrictTopicsEnabled] =useState(() => 
    Boolean(agentData?.info_not_talk_about)
  );
  const [restrictTopicsText, setRestrictTopicsText] = useState("");
  const [authEnabled, setAuthEnabled] = useState(false);
  const [authType, setAuthType] = useState("");
  const [harmfulContentEnabled, setHarmfulContentEnabled] = useState(true);
  const [severityFilter, setSeverityFilter] = useState("moderate");
  const [guardrailsOpen, setGuardrailsOpen] = useState(false);
  const [accessControlEnabled, setAccessControlEnabled] = useState(false);
  const [directoryServer, setDirectoryServer] = useState("");
  const [customAuthFlow, setCustomAuthFlow] = useState(false);
const [refreshTokenEndpoint, setRefreshTokenEndpoint] = useState("");
const [attributeOptions, setAttributeOptions] = useState([]);
  // const [authType, setAuthType] = useState("magic_auth");
  const [directoryId, setDirectoryId] = useState("");
  const [accessRules, setAccessRules] = useState<AccessRule[]>([
    {
      attribute: "",
      operator: "",
      value: "",
      ai_instruction: ""
    }
  ]);
  const [samlProviders, setSamlProviders] = useState([]); // New state for SAML providers
  const [selectedSamlAppId, setSelectedSamlAppId] = useState(""); // New state for selected SAML app_id


  const alwaysOnGuardrails = [
    { name: "Prompt Injection Protection", description: "Blocks malicious prompt manipulation attempts" },
    { name: "Sensitive Data Filter", description: "Prevents exposure of PII, passwords, and financial data" },
    { name: "Toxicity & Bias Filter", description: "Filters harmful, offensive, or biased content" },
    { name: "Output Length Control", description: "Prevents excessively long or resource-intensive responses" },
  ];

  const configurableSettings = [
    { 
      id: "restrict-topics", 
      name: "Restrict sensitive topics", 
      description: "Blocks discussions of sensitive, harmful, or regulated content.",
      defaultOn: false 
    },
    { 
      id: "auth-flows", 
      name: "Enable authentication & authorization flows", 
      description: "Ensures the agent validates identity before performing critical actions.",
      defaultOn: false 
    },
    {
      id: "access-control",
      name: "Access Control",
      description: "Restrict access based on directory attributes",
      defaultOn: false
    }
    // { 
    //   id: "harmful-content", 
    //   name: "Prevention of harmful & offensive content", 
    //   description: "Filters harmful, offensive, or biased responses before delivery.",
    //   defaultOn: true 
    // },
  ];
   useEffect(() => {
    if (agentData?.access_control) {
      setAccessControlEnabled(agentData.access_control.enableAccessControl || false);
      setAuthType(agentData.access_control.auth_type || "");
      //  setDirectoryId(agentData.access_control.directory_id || "");
       if (agentData.access_control.auth_type === "saml_auth" && agentData.access_control.app_id) {
        setSelectedSamlAppId(agentData.access_control.app_id);
       }
      setAccessRules(agentData.access_control.access_rules || [
        { attribute: "", operator: "", value: "", ai_instruction: "" }
      ]);
    }
  }, [agentData?.access_control]);
  useEffect(() => {
    if (agentData) {
      if (agentData.info_not_talk_about) {
        setRestrictTopicsText(agentData.info_not_talk_about);
        setRestrictTopicsEnabled(true);
      } else {
        setRestrictTopicsText("");
        setRestrictTopicsEnabled(false);
      }
      
    }
  }, [agentData?.info_not_talk_about]);
useEffect(() => {
  if (agentData?.custom_auth_flow !== undefined) {
    setCustomAuthFlow(agentData.custom_auth_flow);
    setAuthEnabled(agentData.custom_auth_flow); // Set authEnabled based on custom_auth_flow
  }
  if (agentData?.custom_auth_endpoints?.refresh_token_endpoint) {
    setRefreshTokenEndpoint(agentData.custom_auth_endpoints.refresh_token_endpoint);
  }
  // Set authType to "authentication" if custom_auth_flow is true
  if (agentData?.custom_auth_flow) {
    setAuthType("authentication");
  }
}, [agentData]);

useEffect(() => {
  const loadAttributes = async () => {
    try {
      // const attributes = await fetchSchemaAttributes();
      // setAttributeOptions(attributes);
       const response = await requestApi('GET','schema/',null,'accountService');
const result = response
    // Extract attribute names and set them directly
    const attributes = result.data?.attribute_mapping?.map(attr => ({
      value: attr.attribute_name,
      label: attr.attribute_name.charAt(0).toUpperCase() + attr.attribute_name.slice(1)
    })) || [];
    
    setAttributeOptions(attributes);
    } catch (error) {
      console.error('Failed to load attributes:', error);
      // Fallback to default options if API fails
      setAttributeOptions([]);
    }
  };

  loadAttributes();
}, []);

// New useEffect to fetch SAML providers
useEffect(() => {
  if (authType === "saml_auth") {
    const fetchSamlProviders = async () => {
      const payload = {
    "sort": "desc",
    "sortby": "created",
    "page": {
        "size": 20,
        "page_number": 1
    },
    "filter": []
}
      try {
        const response = await requestApi('POST', 'saml/configuration/filter/', payload, 'samlService'); 
        setSamlProviders(response.data || []);
        console.log("SAML Providers API response:", response.data); 
      } catch (error) {
        console.error('Failed to fetch SAML providers:', error); 
        setSamlProviders([]);
      }
    };
    fetchSamlProviders();
  } else {
    setSamlProviders([]);
    // Removed setSelectedSamlAppId(""); from here
  }
}, [authType]);

    const handleAddRule = () => {
    const newRule: AccessRule = {
      attribute: "",
      operator: "",
      value: "",
      ai_instruction: ""
    };
    const updatedRules = [...accessRules, newRule];
    setAccessRules(updatedRules);
    updateAccessControl({ access_rules: updatedRules });
  }
 const handleRemoveRule = (index: number) => {
    const updatedRules = accessRules.filter((_, i) => i !== index);
    setAccessRules(updatedRules);
    updateAccessControl({ access_rules: updatedRules });
  };

  const handleRuleChange = (index: number, field: keyof AccessRule, value: string) => {
    const updatedRules = accessRules.map((rule, i) => 
      i === index ? { ...rule, [field]: value } : rule
    );
    setAccessRules(updatedRules);
    updateAccessControl({ access_rules: updatedRules });
  };

  const updateAccessControl = (updates: Partial<AccessControlData>) => {
    const accessControlData = {
      enableAccessControl: accessControlEnabled,
      auth_type: authType,
      // directory_id: directoryId,
      app_id: authType === "saml_auth" ? selectedSamlAppId : undefined, // Include app_id only for SAML
      access_rules: accessRules,
      ...updates
    };
    onChange?.({ access_control: accessControlData });
  };

  // Trigger updateAccessControl when selectedSamlAppId changes
  useEffect(() => {
    if (authType === "saml_auth") {
      updateAccessControl({ app_id: selectedSamlAppId });
    }
  }, [selectedSamlAppId, authType]);

  const selectedSamlProviderName = samlProviders.find(
    (provider: any) => provider.id === selectedSamlAppId
  )?.provider_name;

  const operatorOptions = [
    { value: "equals", label: "Equals" },
    { value: "not_equals", label: "Not Equal" },
    { value: "contains", label: "Contains" },
    { value: "not_contains", label: "Not Contains" },

    { value: "starts_with", label: "Starts With" },
    { value: "ends_with", label: "Ends With" },
  ];
  return (
    <div className="space-y-6">
      {/* Always-On Guardrails */}
      <Card className="shadow-soft">
        <Collapsible open={guardrailsOpen} onOpenChange={setGuardrailsOpen}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardTitle className="flex items-center justify-between text-xl text-thunai-text-primary">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-thunai-positive" />
                  Always-On Guardrails
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${guardrailsOpen ? 'rotate-180' : ''}`} />
              </CardTitle>
              <p className="text-sm text-thunai-text-secondary">
                These security measures are always active and cannot be disabled
              </p>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              {alwaysOnGuardrails.map((guardrail, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-thunai-neutral-bg">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-thunai-positive" />
                    <div>
                      <p className="font-medium text-thunai-text-primary">{guardrail.name}</p>
                      <p className="text-sm text-thunai-text-secondary">{guardrail.description}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-thunai-positive border-thunai-positive">
                    Active
                  </Badge>
                </div>
              ))}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* User Configurable Settings */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl text-thunai-text-primary">
            <Lock className="h-5 w-5 text-thunai-accent" />
            Security Configuration
          </CardTitle>
          <p className="text-sm text-thunai-text-secondary">
            Configure additional security settings for your agent
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {configurableSettings.map((setting) => (
            <div key={setting.id} className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border bg-background">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <p className="font-medium text-thunai-text-primary">{setting.name}</p>
                    <p className="text-sm text-thunai-text-secondary">{setting.description}</p>
                    {setting.id === "auth-flows" && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Useful when the agent is accessing private or sensitive enterprise systems.
                      </p>
                    )}
                    {setting.id === "audit-logging" && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Audit logs include test runs, live interactions, and security rule triggers. Logs can be exported anytime.
                      </p>
                    )}
                  </div>
                </div>
                <Switch 
                  defaultChecked={setting.defaultOn}
                  checked={
                    setting.id === "restrict-topics" ? restrictTopicsEnabled :
                    setting.id === "auth-flows" ? authEnabled :
                     setting.id === "access-control" ? accessControlEnabled :
                    setting.id === "harmful-content" ? harmfulContentEnabled :
                    setting.defaultOn
                  }
                  onCheckedChange={(checked) => {
                    if (setting.id === "restrict-topics") setRestrictTopicsEnabled(checked);
                  if (setting.id === "auth-flows") {
  setAuthEnabled(checked);
  if (!checked) {
    // Clear all auth-related state when disabled
    setAuthType("");
    setCustomAuthFlow(false);
    setRefreshTokenEndpoint("");
    // Clear the data in parent component
    onChange?.({ 
      custom_auth_flow: false,
      custom_auth_endpoints: undefined 
    });
  }
}
                    
                    if (setting.id === "access-control") { 
      setAccessControlEnabled(checked);
      if (checked) {
        updateAccessControl({ enableAccessControl: checked });
      } else {
        onChange?.({ access_control: {} });
      }
    }
                    if (setting.id === "harmful-content") setHarmfulContentEnabled(checked);
                  }}
                />
              </div>

              {/* Expanded Options for Restrict Topics */}
              {setting.id === "restrict-topics" && restrictTopicsEnabled && (
                <div className="ml-4 p-4 rounded-lg bg-muted/50 border border-border">
                  <Label className="text-sm font-medium mb-2 block">Specify restricted topics:</Label>
                  <Textarea
                    placeholder="Enter sensitive topics to restrict (e.g., PII, Financial Data, Medical Data, Violence/Self-harm, Hate Speech)..."
                    value={restrictTopicsText}
                    onChange={(e) => {
    setRestrictTopicsText(e.target.value);
    onChange?.({ info_not_talk_about: e.target.value });
  }}
                    className="min-h-[80px]"
                  />
                </div>
              )}

              {/* Expanded Options for Auth & Authorization */}
              {/* {setting.id === "auth-flows" && authEnabled && (
                <div className="ml-4 p-4 rounded-lg bg-muted/50 border border-border">
                  <Label className="text-sm font-medium mb-2 block">Authentication Type:</Label>
                  <Select value={authType} onValueChange={setAuthType}>

                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select authentication type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="authentication">Authentication</SelectItem>
                      <SelectItem value="authorization">Authorization</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )} */}
{setting.id === "auth-flows" && authEnabled && (
  <div className="ml-4 p-4 rounded-lg bg-muted/50 border border-border space-y-4">
    <div className="space-y-2">
      <Label className="text-sm font-medium">Authentication Type:</Label>
      <Select 
        value={authType} 
        onValueChange={(value) => {
          setAuthType(value);
          // Show custom auth UI when "authentication" is selected
          if (value === "authentication") {
            setCustomAuthFlow(true);
            onChange?.({ custom_auth_flow: true });
          } else {
            setCustomAuthFlow(false);
            onChange?.({ 
              custom_auth_flow: false,
              custom_auth_endpoints: undefined 
            });
          }
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select authentication type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">None</SelectItem>
          <SelectItem value="authentication">Authentication</SelectItem>
          {/* <SelectItem value="authorization">Authorization</SelectItem> */}
        </SelectContent>
      </Select>
    </div>

    {/* Custom Auth Endpoints UI - Show when "authentication" is selected */}
    {authType === "authentication" && (
      <div className="p-4 rounded-lg bg-background border space-y-4">
        <div className="space-y-2">
          {/* <Label className="text-sm font-medium">Authentication Settings</Label> */}
         
        </div>
        
        <div className="space-y-2">
          <Label className="text-sm font-medium">Authentication Endpoints</Label>
          <Input
            placeholder="https://your-auth-endpoint.com/api/authenticate"
            value={refreshTokenEndpoint}
            onChange={(e) => {
              setRefreshTokenEndpoint(e.target.value);
              onChange?.({
                custom_auth_endpoints: {
                  refresh_token_endpoint: e.target.value
                }
              });
            }}
            className="w-full"
          />
           <p className="text-xs text-blue-600">
            Enter the URL endpoints that will handle user authentication. This should be a secure HTTPS endpoint.
          </p>
        </div>
      </div>
    )}
  </div>
)}

{setting.id === "access-control" && accessControlEnabled && (
  <div className="ml-4 p-4 rounded-lg bg-muted/50 border border-border space-y-4">
    {/* Directory Server */}
    {/* <div className="space-y-2">
      <Label className="text-sm font-medium">Directory Server</Label>
      <Select 
        value={directoryId} 
        onValueChange={(value) => {
          setDirectoryId(value);
          updateAccessControl({ directory_id: value });
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select server" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="manual">Manual Users</SelectItem>
        </SelectContent>
      </Select>
    </div> */}

    {/* Authentication Type */}
    {/* {directoryId === "manual" && ( */}
    <div className="space-y-2">
      <Label className="text-sm font-medium">Authentication Type</Label>
      <Select 
        value={authType} 
        onValueChange={(value) => {
          setAuthType(value);
          updateAccessControl({ auth_type: value });
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select authentication type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="magic_auth">Magic Auth</SelectItem>
          <SelectItem value="otp_auth">OTP</SelectItem>
          <SelectItem value="saml_auth">SAML</SelectItem> 
        </SelectContent>
      </Select>
    </div>
    {/* )} */}

    {/* SAML Provider Dropdown - Shown when authType is SAML */}
    {authType === "saml_auth" && (
      <div className="space-y-2">
        <Label className="text-sm font-medium">SAML Provider</Label>
        <Select
          value={selectedSamlAppId}
          onValueChange={(value) => {
            setSelectedSamlAppId(value);
          }}
        >
          <SelectTrigger className="w-full">
            {/* <SelectValue>{selectedSamlProviderName || "Select SAML Provider"}</SelectValue> */}

<SelectValue placeholder={selectedSamlProviderName || "Select SAML Provider"} />
          </SelectTrigger>
          <SelectContent>
            {samlProviders.map((provider: any) => (
              provider.provider_name && (
                <SelectItem key={provider.id} value={provider.id}>
                  {provider.provider_name}
                </SelectItem>
              )
            ))}
          </SelectContent>
        </Select>
      </div>
    )}

    {/* Access Rules */}

    {/* {directoryId === "manual" && ( */}

    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Access Rules</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddRule}
          className="text-blue-600 border-blue-200 hover:bg-blue-50"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Rule
        </Button>
      </div>

      {accessRules.map((rule, index) => (
        <div key={index} className="p-4 border rounded-lg bg-background space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Attribute */}
            <div className="space-y-2">
              <Label className="text-xs text-thunai-text-secondary">Attribute</Label>
              <Select
                value={rule.attribute}
                onValueChange={(value) => handleRuleChange(index, 'attribute', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Attribute" />
                </SelectTrigger>
                <SelectContent>
                  {attributeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Operator */}
            <div className="space-y-2">
              <Label className="text-xs text-thunai-text-secondary">Operator</Label>
              <Select
                value={rule.operator}
                onValueChange={(value) => handleRuleChange(index, 'operator', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Operator" />
                </SelectTrigger>
                <SelectContent>
                  {operatorOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Value */}
            <div className="space-y-2">
              <Label className="text-xs text-thunai-text-secondary">Value</Label>
              <Input
                placeholder="Enter value"
                value={rule.value}
                onChange={(e) => handleRuleChange(index, 'value', e.target.value)}
              />
            </div>
          </div>

          {/* AI Instruction */}
          <div className="space-y-2">
            <Label className="text-xs text-thunai-text-secondary">
              AI Instruction for this Access Level
            </Label>
            <Textarea
              placeholder="Additional instructions for the AI"
              value={rule.ai_instruction}
              onChange={(e) => handleRuleChange(index, 'ai_instruction', e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          {/* Remove Rule Button */}
          {accessRules.length > 1 && (
            <div className="flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveRule(index)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove Rule
              </Button>
            </div>
          )}
        </div>
      ))}

      <p className="text-xs text-thunai-text-secondary">
        Rules will be evaluated in order. Users must meet all conditions to gain access.
      </p>
    </div>
    {/* )} */}

  </div>
)}

              {/* Expanded Options for Harmful Content */}
              {/* {setting.id === "harmful-content" && harmfulContentEnabled && (
                <div className="ml-4 p-4 rounded-lg bg-muted/50 border border-border">
                  <Label className="text-sm font-medium mb-2 block">Severity Filter:</Label>
                  <Select value={severityFilter} onValueChange={setSeverityFilter}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="strict">Strict (block any questionable content)</SelectItem>
                      <SelectItem value="moderate">Moderate (block harmful/offensive only)</SelectItem>
                      <SelectItem value="lenient">Lenient (block only extreme cases)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )} */}
            </div>
            
          ))}

            {/* Access Control Expanded Options */}
              
          
        </CardContent>
      </Card>

    </div>
  );
}