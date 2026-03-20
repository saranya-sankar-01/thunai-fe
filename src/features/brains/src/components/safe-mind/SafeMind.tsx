import React, { useState, useEffect, useMemo } from 'react';
import { 
  Shield, Activity, Lock, Zap, 
  Terminal, CheckCircle2, 
  Fingerprint, CreditCard, Mail, 
  Search, AlertOctagon, 
  ArrowRight, BarChart3, 
  Sliders, ShieldAlert, BrainCircuit,
  Eye, EyeOff, MoreHorizontal, Plus, X,
  FileCode, Globe, Server, ArrowLeft, Save,
  AlertTriangle, Check, RefreshCw, Edit2, Power,
  Database, Key, Smartphone, HardDrive, Hash, Eraser, Ban,
  Clock, History, Calendar, User, KeyRound, Link as LinkIcon, Network,
  Sparkles, Loader2, FlaskConical, Beaker, FileText, FileSpreadsheet,
  ChevronRight, Filter,
  Trash2
} from 'lucide-react';
import { getTenantId, requestApi } from '@/services/authService';
import { use } from 'marked';
import { Switch } from '@/components/ui/switch';
import { toast } from "sonner";
import { useSafeMindStore } from '@/store/useSafeMindStore';
import { Button } from '@/components/ui/button';
import ISTTime from '../shared-components/ISTTime';
import usePermissions from '@/hooks/usePermissions';
import { DeleteConfirmationDialog } from '../shared-components/DeleteConfirmationDialog';

// --- Types ---

type pii_type = 'email' | 'Email' | 'credit_card' | 'credit' | 'ip' | 'mac_address' | 'url' | 'custom' | 'content_filter';


interface HistoryItem {
  tenant_id: string;
  policy_id: string;
  file_name: string | null;
  context_data_id: string;
  match_count: number;
  strategy: 'redact' | 'mask' | 'hash' | 'block';
  pii_type: pii_type;
  created: string;
  id: string;
}

interface PiiRule {
  id: string;
  name: string;
  pii_type: pii_type;
  icon: React.ElementType;
  enabled: boolean;
  enforcement_action?:  'redact' | 'mask' | 'hash' | 'block' | 'mack';
  description?: string;
  regex_pattern?: string;
    sensitivity?: number; // 0 to 80 
  created?:string;
  updated?:string;
  status?:string;
}

// --- Mock Data ---

const ICONS = [
  { id: 'shield', icon: Shield, label: 'Security' },
  { id: 'lock', icon: Lock, label: 'Privacy' },
  { id: 'fingerprint', icon: Fingerprint, label: 'Identity' },
  { id: 'credit-card', icon: CreditCard, label: 'Finance' },
  { id: 'mail', icon: Mail, label: 'Comm' },
  { id: 'activity', icon: Activity, label: 'Health' },
  { id: 'key', icon: Key, label: 'Auth' },
  { id: 'server', icon: Server, label: 'Infra' },
  { id: 'globe', icon: Globe, label: 'Web' },
  { id: 'database', icon: Database, label: 'Data' },
  { id: 'file-code', icon: FileCode, label: 'Code' },
  { id: 'smartphone', icon: Smartphone, label: 'Device' },
];


const getMaskedValue = (text: string) => {
    if (text.length <= 4) return '*'.repeat(text.length);
    return '****-****-****-' + text.slice(-4);
};

const getPseudoHash = (type: string, text: string) => {
    // Simple mock hash
    const chars = '0123456789abcdef';
    let hash = '';
    for(let i=0; i<8; i++) hash += chars[Math.floor(Math.random() * chars.length)];
    return `<${type}_hash:${hash}>`;
};

// Default Draft State
const DEFAULT_DRAFT: PiiRule = {
    id: '', 
    name: '', 
    pii_type: 'custom', 
    icon: Shield, 
    enabled: true, 
    sensitivity:0,
    enforcement_action: 'redact', 
    description: '', 
    regex_pattern: ''
};

export const Safemind: React.FC = () => {
  const { canViewModule, canModifyModule } = usePermissions();
  const canModify = canModifyModule("safemind");
  
  const [viewMode, setViewMode] = useState<'dashboard' | 'create_policy' | 'history'>('dashboard');
//   const [piiRules, setPiiRules] = useState([]);//getPolicies());
  const [historyRule, setHistoryRule] = useState<PiiRule | undefined>(undefined);
  const [draftRule, setDraftRule] = useState<PiiRule>(DEFAULT_DRAFT);
  
  // Simulation State (Shared between modes)
  const [simulationInput, setSimulationInput] = useState('Draft an email to john.doe@competitor.com regarding Project Titan specs. My card is 4532-1234-5678-9012.');
  const [processedOutput, setProcessedOutput] = useState<React.ReactNode[]>([]);
  const [interventionLog, setInterventionLog] = useState<{rule: string, count: number, enfourcement_actions: string}[]>([]);
  const [matchCount, setMatchCount] = useState(0);
  const [loadingEnable, setLoadingEnable] = useState<string | null>(null);
  const [isSavingPolicy, setIsSavingPolicy] = useState(false);
    const [deletingRuleId, setDeletingRuleId] = useState<string | null>(null);
    const [isRefreshingPolicies,setIsRefreshingPolicies] = useState(false)
    const [loadingActionRuleId, setLoadingActionRuleId] = useState<string | null>(null); // New state for action button loading
    // const [loadingPolicies,setLoadingPolicies] = useState(false)

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
const [policyToDelete, setPolicyToDelete] = useState<PiiRule | null>(null);

  const tenant_id = getTenantId()
  const { piiRules,setPiiRules, loadingPolicies, getPolicies } = useSafeMindStore();
useEffect(() => {
    getPolicies()
}, []);

const luhnCheck = (cardNumber: string): boolean => {
  const digits = cardNumber.replace(/\D/g, '').split('').map(Number);
  let sum = 0;
  let double = false;

  // Iterate from right to left
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = digits[i];

    if (double) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    sum += digit;
    double = !double;
  }
  return sum % 10 === 0;
};

// Define common PII regex patterns
const PII_REGEX_PATTERNS: Record<pii_type, RegExp | undefined> = {
  'email': /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi,
  'Email': /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi,
  'credit_card': /\b(?:\d[ -]*?){13,19}\b/g,
  'credit': /\b(?:\d[ -]*?){13,19}\b/g,
  'ip': /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
  'mac_address': /\b(?:[0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}\b/g,
  'url': /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/[a-zA-Z0-9]+\.[^\s]{2,}|[a-zA-Z0-9]+\.[^\s]{2,})/g,
  'custom': undefined,
  'content_filter': undefined,
};

  // --- Unified Sandbox Logic ---
  useEffect(() => {
    if (!simulationInput) {
        setProcessedOutput([]);
        setInterventionLog([]);
        setMatchCount(0);
        return;
    }

    // Determine which rules to simulate based on view mode
    let activeRules: PiiRule[] = [];
    
    if (viewMode === 'create_policy') {
        // In policy creation mode, always test the draft rule
        activeRules = [draftRule];
    } else {
        // In dashboard mode, test all enabled rules
        activeRules = piiRules.filter(r => r.enabled);
    }

    // If no rules to test
    if (activeRules.length === 0) {
        setProcessedOutput([<span key="raw">{simulationInput}</span>]);
        setInterventionLog([]);
        setMatchCount(0);
        return;
    }

    // 2. Find matches
    let matches: {start: number, end: number, rule: PiiRule, text: string}[] = [];

    activeRules.forEach(rule => {
        let regexToUse: RegExp | undefined;
        // Use predefined regex for known PII types, if available
        if (rule.pii_type !== 'custom' && PII_REGEX_PATTERNS[rule.pii_type]) {
            regexToUse = PII_REGEX_PATTERNS[rule.pii_type];
        } else if (rule.regex_pattern) {
           
            try {
                regexToUse = new RegExp(rule.regex_pattern, 'gi');
            } catch (e) {
                console.error("Invalid custom regex pattern:", e);
             
            }
        }

        if (regexToUse) {
            let match;
            // Reset lastIndex for global regex to ensure all matches are found
            if (regexToUse.global) regexToUse.lastIndex = 0;
            // while ((match = regexToUse.exec(simulationInput)) !== null) {
            //     matches.push({
            //         start: match.index,
            //         end: match.index + match[0].length,
            //         rule: rule,
            //         text: match[0]
            //     });
            // }
                        while ((match = regexToUse.exec(simulationInput)) !== null) {
                const matchedText = match[0];

                // Apply Luhn validation specifically for credit_card and credit types
                if (rule.pii_type === 'credit_card' || rule.pii_type === 'credit') {
                    if (luhnCheck(matchedText)) {
                        matches.push({
                            start: match.index,
                            end: match.index + matchedText.length,
                            rule: rule,
                            text: matchedText
                        });
                    }
                } else {
                    matches.push({
                        start: match.index,
                        end: match.index + matchedText.length,
                        rule: rule,
                        text: matchedText
                    });
                }
            }

        }
    });

    // 3. Sort and remove overlaps (first match wins)
// Sort matches by starting index (preserve overlap)
matches.sort((a, b) => a.start - b.start);

// Keep all matches — even overlapping ones
const uniqueMatches = matches;

    setMatchCount(uniqueMatches.length);

    // 4. Build Output Nodes
    const nodes: React.ReactNode[] = [];
    let cursor = 0;
    const logCounts: Record<string, {count: number,  enforcement_action: string}> = {};

    uniqueMatches.forEach((m, idx) => {
        // Push text before match
        if (m.start > cursor) {
            nodes.push(<span key={`text-${idx}`}>{simulationInput.slice(cursor, m.start)}</span>);
        }

        // Push match replacement
        let replacementNode: React.ReactNode;
        let actionLabel = '';

        if (m.rule.enforcement_action === 'redact') {
             replacementNode = `[REDACTED]`;
             actionLabel = 'Redacted';
        } else if (m.rule.enforcement_action === 'mask') {
             replacementNode = getMaskedValue(m.text);
             actionLabel = 'Masked';
        } else if (m.rule.enforcement_action === 'hash') {
             replacementNode = getPseudoHash(m.rule.pii_type, m.text);
             actionLabel = 'Hashed';
        } else {
             replacementNode = '[BLOCKED]';
             actionLabel = 'Blocked';
        }

        const actionIcon = m.rule.enforcement_action === 'redact' ? <Eraser size={10} /> : m.rule.enforcement_action === 'hash' ? <Hash size={10} /> : m.rule.enforcement_action === 'mask' ? <EyeOff size={10} /> : <Ban size={10} />;
        const actionColor = m.rule.enforcement_action === 'redact' ? 'bg-slate-700 text-slate-300 border-slate-600' : m.rule.enforcement_action === 'hash' ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : m.rule.enforcement_action === 'mask' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-red-100 text-red-700 border-red-200';
        
        nodes.push(
            <span key={`match-${idx}`} className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-mono font-bold mx-0.5 select-none cursor-help group relative border ${actionColor}`}>
                 {actionIcon}
                 {replacementNode}
                 
                 {/* Tooltip */}
                 <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-gray-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                     {m.rule.name} • {actionLabel}
                 </span>
            </span>
        );
        
        // Log Update
        if (!logCounts[m.rule.name]) logCounts[m.rule.name] = { count: 0,  enforcement_action: m.rule.enforcement_action };
        logCounts[m.rule.name].count++;

        cursor = m.end;
    });

    // Push remaining text
    if (cursor < simulationInput.length) {
        nodes.push(<span key="text-end">{simulationInput.slice(cursor)}</span>);
    }

    setProcessedOutput(nodes);
    setInterventionLog(Object.entries(logCounts).map(([k, v]) => ({ rule: k, count: v.count,  enfourcement_actions: v.enforcement_action })));

  }, [simulationInput, piiRules, draftRule, viewMode]);

 const togglePiiRule = async (id: string) => {
    const ruleToUpdate = piiRules.find(r => r.id === id);
    if (!ruleToUpdate) return;

    const newEnabledState = !ruleToUpdate.enabled;
    const newStatus = newEnabledState ? 'active' : 'inactive';

    setLoadingEnable(id); // Start loading for this rule

    try {

      const payload = {
        status: newStatus, // Send the new status
      };

    const response = await requestApi(
        "PUT",
        `brain/safemind/${tenant_id}/policies/${id}/`,
        payload,
        "brainService"
      );

      await getPolicies(); // Refresh policies to reflect the new status
                toast.success(response?.data?.message || response?.message || "Policy updated successfully.");

      console.log(`Rule ${id} status updated to ${newStatus}`);
    } catch (error) {
      console.error(`Error toggling rule ${id}:`, error);
    toast.error(error?.response?.data?.message || error?.response?.message || "Failed to update");

    } finally {
      setLoadingEnable(null); // Stop loading for this rule
    }
  };

 const setRuleAction = async (id: string, enforcement_action: PiiRule['enforcement_action']) => {
      const ruleToUpdate = piiRules.find(r => r.id === id);
      if (!ruleToUpdate) return;

      const updatedRule = { ...ruleToUpdate, enforcement_action };

      setLoadingActionRuleId(id); // Start loading for this rule's action

      try {
          const response = await requestApi(
              "Put",
              `brain/safemind/${tenant_id}/policies/${updatedRule.id}/`,
              {
                  name: updatedRule.name,
                  description: updatedRule.description,
                  pii_type: updatedRule.pii_type,
                  regex_pattern: updatedRule.regex_pattern,
                  enforcement_action: updatedRule.enforcement_action,
                //   enabled: updatedRule.enabled
              },
              "brainService"
          );
        //   setPiiRules(rules => rules.map(r => r.id === id ? response.data : r));
       await getPolicies();
          console.log("Rule action updated successfully:", response.data);
                toast.success(response?.data?.message || response?.message || "Policy updated successfully.");
      } catch (error) {
          console.error("Error updating rule action:", error);
    toast.error(error?.response?.data?.message || error?.response?.message || "Failed to update!");
      } finally {
          setLoadingActionRuleId(null); // Stop loading for this rule's action
      }
  };

  const handleEditRule = (rule: PiiRule) => {
      setDraftRule({...rule}); 
      setViewMode('create_policy');
  };

  const handleCreateRule = () => {
      setDraftRule({ ...DEFAULT_DRAFT, id:null });
      setViewMode('create_policy');
  };

  const handleViewHistory = (rule: PiiRule) => {
      setHistoryRule(rule);
      setViewMode('history');
  };

const handleSavePolicy = async () => {
      const policyToSave = { ...draftRule };
        const requiredFields = [
    "name",
    "description",
    "pii_type",
    // "regex_pattern",
    "enforcement_action",
    "sensitivity",
    // "icon"
  ];

  for (const field of requiredFields) {
    if (!policyToSave[field] || policyToSave[field] === "") {
     toast.error(`Please fill the mandatory field: ${field}`, {
  style: {
    background: "#ffefef",
    border: "1px solid #c40000",
  },
});
      return;
    }
  }
   const selectedIconItem = ICONS.find(item => item.icon === policyToSave.icon);
    const iconIdToSend = selectedIconItem ? selectedIconItem.id : 'shield'; // Default to 'shield' if not found


      const payload= {
          name: policyToSave.name,
          description: policyToSave.description,
          pii_type: policyToSave.pii_type,
          regex_pattern: policyToSave.regex_pattern,
          enforcement_action: policyToSave.enforcement_action,
          sensitivity:policyToSave.sensitivity,  
   icon_key: iconIdToSend 
        //   enabled: policyToSave.enabled
      };
  setIsSavingPolicy(true);
      try {
          let response;
          if (policyToSave.id && policyToSave.id !== '') { // Existing policy (EDIT)
              response = await requestApi(
                  "PUT",
                  `brain/safemind/${tenant_id}/policies/${policyToSave.id}/`,
                   payload , 
                  "brainService"
              );
             
              console.log("Policy updated successfully:", response.data);
                toast.success(response?.data?.message || response?.message || "Policy updated successfully.");
          } else { // New policy (CREATE)
              response = await requestApi(
                  "POST",
                  `brain/safemind/${tenant_id}/policies/`,
                  payload,
                  "brainService"
              );
              console.log("Policy created successfully:", response.data);
                toast.success(response?.data?.message || response?.message || "Policy created successfully.");
          }

          setViewMode('dashboard');
          setDraftRule(DEFAULT_DRAFT); // Reset draft rule
         
          await getPolicies();

      } catch (error) {
          console.error("Error saving policy:", error);
             toast.error(error?.response?.data?.message || error?.response?.message || "Failed to save!");
      }
       finally {
        setIsSavingPolicy(false); 
    }
  };
  const handleDeleteClick = (rule: PiiRule) => {
    setPolicyToDelete(rule);
    setIsDeleteDialogOpen(true);
};

const handleConfirmDelete = async () => {
    if (!policyToDelete) return;
    
    setDeletingRuleId(policyToDelete.id);
    try {
        const response = await requestApi(
            "DELETE",
            `brain/safemind/${tenant_id}/policies/${policyToDelete.id}/`,
            null,
            "brainService"
        );
        await getPolicies();
        toast.success(response?.data?.message || response?.message || "Policy deleted successfully.");
    } catch (error) {
    toast.error(error?.response?.data?.message || error?.response?.message || "Failed to delete policy!");
    }
    finally {
        setDeletingRuleId(null); 
        setIsDeleteDialogOpen(false);
        setPolicyToDelete(null);
    }
};
const handleRefreshPolicies = async () => {
    setIsRefreshingPolicies(true)
    await getPolicies()
    setIsRefreshingPolicies(false)
}
  return (
    <div className="flex flex-col space-y-6 animate-in fade-in duration-500 pb-10 overflow-y-auto">
      
      {/* Header Section */}
      <div className="pt-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
               <Shield className="text-blue-600" />
               Safe Mind Security Hub
            </h1>
            <p className="text-gray-500 text-sm mt-1">Autonomous PII protection and sensitive data masking policies.</p>
        </div>
        
    <div className="flex items-center gap-4">
    {/* Configure Button */}
    {viewMode !== "create_policy" && (
        <>
    {/* Refresh Button */}
         <Button
        onClick={handleRefreshPolicies}
        className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg 
                   text-gray-700 text-sm font-medium bg-white hover:bg-gray-100 
                   shadow-sm transition-colors"
    >
        <RefreshCw size={16} className={loadingPolicies ? "animate-spin" : ""} />
        
    </Button>
        {canModify && (
        <Button 
            onClick={handleCreateRule}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white 
                       text-sm font-medium rounded-lg hover:bg-slate-800 
                       shadow-sm transition-colors"
        >
            <Sliders size={16} /> Configure Global Policies
        </Button>
        )}
        </>
    )}
</div>

      </div>

      {/* Main Grid Layout - Sandbox is now PERSISTENT in Right Column */}
      <div className="grid grid-cols-12 gap-6  ">

        {/* --- LEFT / CENTER COLUMN (Dynamic Content) --- */}
        <div className="col-span-12 xl:col-span-8 overflow-y-auto h-[calc(100vh-320px)]">
            {viewMode === 'dashboard' ? (
                 <div className="flex flex-col gap-6">
                     <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-4 items-start">
                         <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                             <Lock size={20} />
                         </div>
                         <div>
                             <h3 className="text-sm font-bold text-gray-900">PII Data Protection</h3>
                             <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                                 Configure how SafeMind handles sensitive entities found in documents and streams. 
                                 Changes here apply globally to all ingestion pipelines.
                             </p>
                         </div>
                     </div>
                      {isRefreshingPolicies ? (
  // When Refreshing
  <div className="col-span-full flex flex-col justify-center items-center py-20 gap-3">
    <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
  </div>
) : loadingPolicies && piiRules?.length === 0 ? (
  // Loading initial PII rules
  <div className="w-full flex justify-center py-10">
    <Loader2 className="animate-spin h-6 w-6 text-blue-600" />
  </div>
) : piiRules?.length === 0 ? (
  // Empty state
  <div className="text-center text-gray-500 py-10">
    No PII rules found.
  </div>
) : (
  // Show table when data exists
  <PiiMatrix
    rules={piiRules}
    onToggle={togglePiiRule}
    onActionChange={setRuleAction}
    onEdit={handleEditRule}
    onHistory={handleViewHistory}
    onCreate={handleCreateRule}
    onDelete={handleDeleteClick}
    loadingEnable={loadingEnable}
    deletingRuleId={deletingRuleId}
    loadingActionRuleId={loadingActionRuleId}
    canModify={canModify}
  />
)}

<DeleteConfirmationDialog
    isOpen={isDeleteDialogOpen}
    onClose={() => {
        setIsDeleteDialogOpen(false);
        setPolicyToDelete(null);
    }}
    onConfirm={handleConfirmDelete}
    title="Delete PII"
    description={`Are you sure you want to delete the policy "${policyToDelete?.name}"? This action cannot be undone.`}
    isDeleting={deletingRuleId === policyToDelete?.id}
/>

                 </div>
            ) : viewMode === 'create_policy' ? (
                 <CreatePolicyForm 
                    draft={draftRule} 
                    onChange={setDraftRule} 
                    onSave={handleSavePolicy}
                    onBack={() => setViewMode('dashboard')}
                    isSaving={isSavingPolicy}
                    canModify={canModify}
                 />
            ) : (
                 <RuleHistoryView rule={historyRule!} onBack={() => setViewMode('dashboard')} />
            )}
        </div>

        {/* --- RIGHT COLUMN (Persistent Sandbox) --- */}
        <div className="col-span-12 xl:col-span-4 flex flex-col gap-6 overflow-y-auto h-[calc(100vh-320px)]">
            
            {/* Simulation Sandbox - Now takes full height of column essentially */}
            <div className={`bg-white border rounded-xl shadow-sm flex flex-col overflow-y-auto h-[calc(100vh-320px)] transition-colors duration-300 ${
                viewMode === 'create_policy' ? 'border-purple-200 ring-4 ring-purple-50' : 'border-gray-200'
            }`}>
                <div className={`px-5 py-4 border-b flex items-center justify-between ${
                    viewMode === 'create_policy' ? 'bg-purple-50/50 border-purple-100' : 'bg-gray-50/50 border-gray-200'
                }`}>
                     <div className="flex items-center gap-2">
                         {viewMode === 'create_policy' ? <Beaker size={16} className="text-purple-600" /> : <Terminal size={16} className="text-gray-600" />}
                         <span className={`text-sm font-bold ${viewMode === 'create_policy' ? 'text-purple-900' : 'text-gray-900'}`}>
                            {viewMode === 'create_policy' ? 'Policy Test Sandbox' : 'Global Behavior Sandbox'}
                         </span>
                     </div>
                     <div className="flex items-center gap-2">
                        {viewMode === 'create_policy' && (
                            <span className="text-[10px] font-bold bg-white text-purple-600 px-2 py-0.5 rounded border border-purple-200 shadow-sm">
                                TESTING DRAFT
                            </span>
                        )}
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${matchCount > 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
                             {matchCount} Matches
                        </span>
                     </div>
                </div>
                
                <div className="flex-1 p-5 space-y-6 ">
                    {/* Input */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Test Input</label>
                        <textarea 
                            value={simulationInput}
                            onChange={(e) => setSimulationInput(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 resize-none h-32 placeholder:text-gray-400 font-medium"
                            placeholder="Type text containing PII to test policy..."
                        />
                    </div>

                    {/* Processing Arrow */}
                    <div className="flex justify-center">
                         <div className={`p-2 rounded-full shadow-sm ${viewMode === 'create_policy' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                            <ArrowRight size={16} className="rotate-90" />
                         </div>
                    </div>

                    {/* Output */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Processed Output</label>
                            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-100 font-mono">
                                Live Preview
                            </span>
                        </div>
                        <div className="w-full bg-white border border-gray-200 rounded-lg p-4 text-sm leading-relaxed text-gray-700 shadow-inner min-h-[140px] break-words">
                             {processedOutput.length > 0 ? processedOutput : <span className="text-gray-400 italic">No input to process...</span>}
                        </div>
                    </div>

                    {/* Active Intervention Log */}
                    {interventionLog.length > 0 && (
                        <div className="p-4 bg-orange-50 rounded-lg border border-orange-100 space-y-2 animate-in fade-in slide-in-from-bottom-2">
                            <div className="flex items-center gap-2 text-xs font-bold text-orange-700 uppercase">
                                <ShieldAlert size={14} /> Intervention Summary
                            </div>
                            <div className="space-y-1">
                                {interventionLog.map((log, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-xs text-gray-700">
                                        <span>Matches found for <span className="font-semibold">{log.rule}</span></span>
                                        <span className="font-mono bg-white px-1.5 rounded border border-orange-200 text-orange-800">
                                            {log.count}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

        </div>

      </div>
    </div>
  );
};

// --- Extracted Components for Cleaner Layout ---

const PiiMatrix = ({ rules, onToggle, onActionChange, onEdit, onHistory, onCreate, onDelete,loadingEnable ,deletingRuleId, loadingActionRuleId, canModify}: any) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredRules = rules.filter((rule: PiiRule) =>
        rule.name.toLowerCase().includes(searchTerm.toLowerCase()) 
    );

    return (
        <>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 flex items-center justify-between bg-gray-50/50">
                    <div>
                        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                            <Fingerprint className="text-blue-600" size={18} />
                            Intelligent PII Matrix
                        </h2>
                        <p className="text-xs text-gray-500">Manage data redaction rules and sensitivity thresholds.</p>
                    </div>
                    <div className="flex gap-2">
                        {canModify && (
                        <Button 
                            onClick={onCreate}
                            className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
                        >
                            <Plus size={16} />
                        </Button>
                        )}
                        
                       <div className="relative w-full max-w-sm">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />

  <input
    type="text"
    placeholder="Search rules..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm 
               focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
  />
</div>

                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 overflow-y-auto pr-1 flex-1">
                {filteredRules.map((rule: PiiRule) => (
                    <div key={rule.id} className={`bg-white border rounded-xl p-5 transition-all duration-200 hover:shadow-md ${rule.enabled ? 'border-gray-200' : 'border-gray-100 opacity-70'}`}>
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl ${rule.enabled ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                                    {React.createElement((rule.icon), { size: 20 })}
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-gray-900">{rule.name}</h4>
                                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{rule.description}</p>
                                </div>
                            </div>
                            
                            <div className="flex flex-col items-end gap-2">
<div className="relative flex items-center gap-2">
    {loadingEnable === rule.id && (
            <Loader2 size={18} className="animate-spin text-blue-600" />
      
    )}

    <Switch
        checked={rule.enabled}
        onCheckedChange={() => onToggle(rule.id)}
        disabled={loadingEnable === rule.id || !canModify}
        className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-300"
    />
</div>

                                <div className="flex gap-1">
                                    <button onClick={() => onHistory(rule)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="View History & Impact">
                                        <History size={16} />
                                    </button>
                                    {canModify && (
                                    <button onClick={() => onEdit(rule)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                                        <Edit2 size={16} />
                                    </button>
                                    )}
                                    {canModify && (
                                    <button onClick={() => onDelete(rule)}  disabled={deletingRuleId === rule.id}  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                                          {deletingRuleId === rule.id ? ( 
        <Loader2 size={16} className="animate-spin" />
    ) : (
        <Trash2 size={16} />
    )}
                                    </button>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Enforcement Mode</span>
                            <div className="flex bg-gray-100 p-0.5 rounded-lg">
                               {(['redact', 'mask', 'hash', 'block'] as const).map((act) => {
    const isActive = rule.enforcement_action === act;
    const isLoading = loadingActionRuleId === rule.id && isActive;

    return (
        <button
            key={act}
            onClick={() => onActionChange(rule.id, act)}
            disabled={loadingActionRuleId === rule.id || !canModify} 
            className={`
                px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all flex items-center gap-1
                ${isActive 
                    ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}
                ${(loadingActionRuleId === rule.id || !canModify) ? 'opacity-50 cursor-not-allowed' : ''}
            `}
        >
            <span>{act}</span>

            {/* Loader on the right side */}
            {/* {isLoading && (
                <Loader2 size={10} className="animate-spin ml-1" />
            )} */}
        </button>
    );
})}

                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};

// --- Sub-View Component: CreatePolicyForm ---
const CreatePolicyForm: React.FC<{ draft: PiiRule, onChange: (r: PiiRule) => void, onSave: () => void, onBack: () => void,isSaving: boolean, canModify: boolean }> = ({ draft, onChange, onSave, onBack,isSaving, canModify }) => {
    const [isGenerating, setIsGenerating] = useState(false);
const canAutoGenerate = draft.name && draft.description;
const tenant_id = getTenantId();
const handleGenerateAI = async () => { // Made async
    if (!canAutoGenerate) return; 
    setIsGenerating(true);
    try {
        const payload = {
            title: draft.name,
            description: draft.description
        };

        const response = await requestApi(
            "POST",
         `brain/safemind-draft/${tenant_id}/`, 
            payload,
            "brainService" 
        );

        if (response.data && response.data.regex_pattern) {
            onChange({
                ...draft,
                regex_pattern: response.data.regex_pattern
            });
            toast.success(response?.data?.message || response?.message || "AI-generated regex pattern applied successfully.");
        } 

    } catch (error) {
        console.error("Error generating AI regex:", error);
  toast.error(error?.response?.data?.message || error?.response?.message || "Failed to generate regex pattern. Please try again.")
    } finally {
        setIsGenerating(false);
    }
};

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden h-full flex flex-col animate-in slide-in-from-left-4 duration-300">
            {/* Header */}
            <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{draft.id ? 'Edit Policy' : 'New Policy'}</h2>
                        <p className="text-sm text-gray-500">Define detection rules for sensitive entities.</p>
                    </div>
                </div>
        
                <div className="flex gap-2">
           
                  <button
    onClick={onSave}
    disabled={isSaving}
    className="flex items-center gap-2 px-5 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 shadow-lg disabled:opacity-70"
>
    {isSaving ? (
        <>
            <Loader2 size={16} className="animate-spin" />
            Saving...
        </>
    ) : (
        <>
            <Save size={16} />
            Save Policy
        </>
    )}
</button>

                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {/* Configuration Section */}
                <div className="space-y-6">
                     <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
                        <Settings size={18} className="text-gray-400" />
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Policy Configuration</h3>
                     </div>

                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Policy Name</label>
                        <input 
                            type="text" 
                            value={draft.name}
                            onChange={e => onChange({...draft, name: e.target.value})}
                            placeholder="e.g. Internal Project Codes" 
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                        <textarea 
                            value={draft.description}
                            onChange={e => onChange({...draft, description: e.target.value})}
                            rows={3}
                            placeholder="Describe what this rule protects..." 
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none resize-none transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">PII Type</label>
                            <select 
                                value={draft.pii_type}
                                onChange={(e) => {
                                    const selectedType = e.target.value as pii_type;
                                    onChange({
                                        ...draft, 
                                        pii_type: selectedType,
                                        enforcement_action: selectedType === 'content_filter' ? 'block' : draft.enforcement_action
                                    });
                                }}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                            >
                                <option value="custom">Custom (Regex)</option>
                                <option value="email">Email Address</option>
                                <option value="credit_card">Credit Card</option>
                                <option value="ip">IP Address</option>
                                <option value="mac_address">Mac Address</option>
                                <option value="url">URL / Link</option>
                                <option value="content_filter">Content Filter</option>
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Icon</label>
                            <div className="grid grid-cols-6 gap-2">
                                {ICONS.slice(0, 6).map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => onChange({...draft, icon: item.icon})}
                                        className={`p-2.5 rounded-lg border flex items-center justify-center transition-all ${
                                            draft.icon === item.icon
                                            ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                                            : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50 hover:border-gray-300'
                                        }`}
                                    >
                                        <item.icon size={18} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Detection Logic Section */}
                <div className="space-y-6">
                    {/* Sensitivity */}
<div>
    <label className="block text-sm font-bold text-gray-700 mb-2">
        Sensitivity <span className="text-gray-500">(0–100)</span>
    </label>

    <div className="flex items-center gap-4">
        {/* Slider */}
        <input
            type="range"
            min={0}
            max={100}
            value={draft.sensitivity ?? 40}
            onChange={(e) =>
                onChange({ ...draft, sensitivity: Number(e.target.value) })
            }
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />

        {/* Number Display */}
        <span className="text-sm font-semibold text-gray-800 w-10 text-center">
            {draft.sensitivity ?? 40}
        </span>
    </div>

    <p className="text-xs text-gray-500 mt-2">
        Lower sensitivity = strict matching. Higher sensitivity = more flexible matching.
    </p>
</div>
{draft.pii_type === "custom" && (
    <>
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
                        <FileCode size={18} className="text-gray-400" />
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Detection Logic</h3>
                    </div>

                 <div>
  <div className="flex items-center justify-between mb-2">
    <label className="block text-sm font-bold text-gray-700">
      Regex regex_pattern
    </label>

    {canAutoGenerate && (
      <button
        onClick={handleGenerateAI}
        disabled={isGenerating}
        className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-700 text-xs font-bold rounded-lg hover:bg-purple-100 transition-colors disabled:opacity-60"
      >
        {isGenerating ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Sparkles size={14} />
        )}
        Auto-Generate
      </button>
    )}
  </div>

                        <div className="relative group">
    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
      <Hash
        size={16}
        className="text-gray-400 group-focus-within:text-blue-500 transition-colors"
      />
                            </div>
                            <input 
                                type="text" 
                                value={draft.regex_pattern}
                                onChange={e => onChange({...draft, regex_pattern: e.target.value})}
                                placeholder="e.g. \b(TITAN|APOLLO)-\d{4}\b" 
                                className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl font-mono text-sm text-emerald-400 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all placeholder:text-slate-600 shadow-inner"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Check the live sandbox on the right to test your regex_pattern.</p>
                    </div>
                                       </>
  )}
                </div>

                {/* Action Section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
                        <Lock size={18} className="text-gray-400" />
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Enforcement Action</h3>
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                       {(['redact', 'mask', 'hash', 'block'] as const).map(act => {
    const isDisabled = draft.pii_type === 'content_filter' && act !== 'block';
    
    return (
        <button
            key={act}
            onClick={() => !isDisabled && onChange({...draft, enforcement_action: act})}
            disabled={isDisabled}
            className={`px-4 py-3 rounded-xl border text-sm font-bold flex flex-col items-center justify-center gap-2 transition-all ${
                draft.enforcement_action === act 
                ? 'bg-slate-50 border-blue-500 text-blue-700 shadow-sm ring-1 ring-blue-500/20' 
                : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700'
            } ${isDisabled ? 'opacity-40 cursor-not-allowed grayscale' : ''}`}
        >
            <span className="capitalize">{act}</span>
            {draft.enforcement_action === act && <CheckCircle2 size={16} className="text-blue-600" />}
        </button>
    );
})}

                    </div>
                </div>
            </div>
        </div>
    );
};


// --- RuleHistoryView ---

export const RuleHistoryView: React.FC<{ rule: PiiRule, onBack: () => void }> = ({ rule, onBack }) => {
    const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const tenant_id = getTenantId()

    useEffect(() => {
        const fetchPolicyHistory = async () => {
            if (!rule.id || !tenant_id) {
                setLoadingHistory(false);
                return;
            }
            setLoadingHistory(true);
            try {
                // brain/safemind-policy-history/thunai1756813944616/69397c58db856eedc3ecd148/
                const response = await requestApi(
                    "GET",
                    `brain/safemind-policy-history/${tenant_id}/${rule.id}/`,
                    null, 
                    "brainService"
                );

                if (response && response.data) {
                    setHistoryData(response.data);
                } else {
                    setHistoryData([]);
                }
            } catch (error) {
                console.error("Error fetching policy history:", error);
                toast.error("Failed to fetch policy history.");
                setHistoryData([]);
            } finally {
                setLoadingHistory(false);
            }
        };

        fetchPolicyHistory();
    }, [rule.id, tenant_id]);

    const getFileIcon = (type: string) => {
        switch(type) {
            case 'pdf': return <FileText size={18} className="text-red-500" />;
            case 'url': case 'csv': return <LinkIcon size={18} className="text-emerald-500" />;
            case 'ip': return <LinkIcon size={18} className="text-blue-500" />;
            case 'Email': return <Mail size={18} className="text-purple-500" />;
            case 'credit_card': return <CreditCard size={18} className="text-orange-500" />;
            default: return <FileCode size={18} className="text-gray-500" />;
        }
    };

    return (
        <div className="h-full bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col animate-in slide-in-from-right-4 duration-300">
             {/* Minimal Header for Navigation */}
             <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-500">
                        <ArrowLeft size={16} />
                    </button>
                    <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                        {React.createElement((rule.icon), { size: 18, className: "text-blue-600" })}
                        {rule.name} Impact History
                    </h2>
                </div>
                <div className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                    {loadingHistory ? <Loader2 size={14} className="animate-spin" /> : `${historyData.length} Documents`}
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50/30">
                {loadingHistory ? (
                    <div className="flex justify-center items-center h-full">
                        <Loader2 size={24} className="animate-spin text-blue-600" />
                    </div>
                ) : historyData.length === 0 ? (
                    <div className="text-center text-gray-500 py-10">
                        No history found for this policy.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {historyData.map((data) => (
                            <div key={data.id} className="group flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl hover:shadow-sm hover:border-blue-300 transition-all cursor-default">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="p-2 bg-gray-50 rounded-lg border border-gray-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                                        {getFileIcon(data.pii_type)}
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-xs font-bold text-gray-900 truncate">{data?.file_name || "Untitled"}</h4>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[10px] text-gray-500 font-mono">{<ISTTime utcString={data.created}/>}</span>
                                            <span className="w-0.5 h-0.5 rounded-full bg-gray-300"></span>
                                            <span className="text-[10px] text-blue-600 font-medium">{data.match_count} matches</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                                        data.strategy === 'redact'  ? 'bg-slate-100 text-slate-600 border-slate-200' :
                                        data.strategy === 'mask'  ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                        data.strategy === 'block'  ? 'bg-red-50 text-red-600 border-red-200' :
                                        'bg-indigo-50 text-indigo-600 border-indigo-200'
                                    }`}>
                                        {data.strategy}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// Helper components for icons in history
function Settings(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1-1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg> }