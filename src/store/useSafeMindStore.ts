import { create } from "zustand";
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
import { getTenantId, requestApi } from "@/services/authService";
import { toast } from "sonner";
type pii_type = 'email' | 'Email' | 'credit_card' | 'credit' | 'ip' | 'mac_address' | 'url' | 'custom';


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
interface PiiStore {
  piiRules: PiiRule[];
  loadingPolicies: boolean;

  // actions
  setPiiRules: (rules: PiiRule[]) => void;
  setLoadingPolicies: (value: boolean) => void;

  getPolicies: () => Promise<void>;
}

export const useSafeMindStore = create<PiiStore>((set, get) => ({
  piiRules: [],
  loadingPolicies: false,

  setPiiRules: (rules) => set({ piiRules: rules }),
  setLoadingPolicies: (value) => set({ loadingPolicies: value }),

  // API call
  getPolicies: async () => {
    const { setPiiRules, setLoadingPolicies } = get();
  const tenant_id = getTenantId()

    try {
      setLoadingPolicies(true);

      const response = await requestApi(
        "Get",
        `brain/safemind/${tenant_id}/policies/`,
        null,
        "brainService"
      );

      const mappedRules = response.data.map((rule: any) => ({
        ...rule,
        enabled: rule.status === "active",
        icon: ICONS.find((item) => item.id === rule.icon_key)?.icon || Shield,
      }));

      setPiiRules(mappedRules);

    } catch (error) {
      console.error("Error fetching policies:", error);
          toast.error(error?.response?.data?.message || error?.response?.message || "Failed to save!");
    } finally {
      setLoadingPolicies(false);
    }
  },
}));
