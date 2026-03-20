
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft, Plus, Save, Trash2, BrainCircuit, FileText, Settings,
  AlertCircle, CheckCircle2, GripVertical, Scale, FileBarChart, Code2,
  BookOpen, Database, Cpu, Shield, Zap, Globe, Network, Briefcase,
  GraduationCap, Lightbulb, Layers, ChevronDown
} from 'lucide-react';
import { useLearningSets } from '@/store/useLearningSets'; // Import the Zustand store
import { getTenantId } from '@/services/authService';
import { toast } from 'sonner';

interface InstructionSetCreatorProps {
  onBack?: () => void;
}

const ICONS = [
  { id: 'brain', icon: BrainCircuit, label: 'Neural' },
  { id: 'legal_balance', icon: Scale, label: 'Legal' },
  { id: 'finance', icon: FileBarChart, label: 'Finance' },
  { id: 'developer_tools', icon: Code2, label: 'Tech' },
  { id: 'knowledge', icon: BookOpen, label: 'Knowledge' },
  { id: 'neural_context', icon: Database, label: 'Data' },
  { id: 'config_rules', icon: Cpu, label: 'System' },
  { id: 'docs', icon: FileText, label: 'Docs' },
  { id: 'security_shield', icon: Shield, label: 'Security' },
  { id: 'automation_trigger', icon: Zap, label: 'Action' },
  { id: 'global_scope', icon: Globe, label: 'Web' },
  { id: 'data_package', icon: Network, label: 'Network' },
  { id: 'business', icon: Briefcase, label: 'Business' },
  { id: 'edu', icon: GraduationCap, label: 'Education' },
  { id: 'insight_idea', icon: Lightbulb, label: 'Idea' },
];

const ActionDropdown = ({ value, onChange }: { value: string; onChange: (val: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const config = {
    ignore: {
        label: 'IGNORE',
        style: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 focus:ring-emerald-200'
    },
    detect: {
        label: 'DETECT',
        style: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:border-blue-300 focus:ring-blue-200'
    },
    resolve: {
        label: 'RESOLVE',
        style: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 hover:border-orange-300 focus:ring-orange-200'
    },
  }[value as 'ignore' | 'detect' | 'resolve'] || { label: 'SELECT', style: 'bg-gray-50 text-gray-700 border-gray-200' };
  return (
    <div className="relative">
      {isOpen && <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-2.5 text-xs font-bold border rounded-lg flex items-center justify-between transition-all focus:ring-4 focus:ring-opacity-50 ${config.style}`}
      >
        {config.label}
        <ChevronDown size={14} className={`transition-transform duration-200 opacity-70 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-20 py-1.5 animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
           {Object.entries({
              ignore: 'IGNORE',
              detect: 'DETECT',
              resolve: 'RESOLVE'
           }).map(([key, label]) => (
              <button
                key={key}
                onClick={() => { onChange(key); setIsOpen(false); }}
                className={`w-full text-left px-3 py-2 text-xs font-bold hover:bg-gray-50 flex items-center justify-between group transition-colors`}
              >
                 <span className={`px-2 py-1 rounded border min-w-[70px] text-center ${
                    key === 'ignore' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                    key === 'detect' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                    'bg-orange-50 text-orange-700 border-orange-100'
                 }`}>
                    {label}
                 </span>
                 {value === key && <CheckCircle2 size={14} className="text-gray-900" />}
              </button>
           ))}
        </div>
      )}
    </div>
  );
};

export const InstructionSetCreator: React.FC<InstructionSetCreatorProps> = () => {
  const { setId } = useParams<{ setId?: string }>(); // Get ID from URL for editing
  console.log(setId)
  const [protocolTitle, setProtocolTitle] = useState('');
  const [protocolDescription, setProtocolDescription] = useState('');
  const [rules, setRules] = useState([{ id: 1, type: 'ignore', text: '' }]);
  const [selectedIconId, setSelectedIconId] = useState('brain');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const navigate = useNavigate();
  const tenant_ID = getTenantId(); 
  const { fetchLearningSets,fetchLearningSetById,saveLearningSet } = useLearningSets(); 

const resetFields = () => {
  setProtocolTitle("");
  setProtocolDescription("");
  setSelectedIconId("brain");
  setRules([{ id: 1, type: "ignore", text: "" }]);
  setIsFetching(false);
};

useEffect(() => {
  const load = async () => {
    if (!setId || !tenant_ID) {
      resetFields();
      return;
    }
    setIsFetching(true);

    const data = await fetchLearningSetById(tenant_ID, setId);

    if (!data) {
      setErrorMessage("Failed to load learning set for editing.");
      setIsFetching(false);
      return;
    }

    setProtocolTitle(data.title || "");
    setProtocolDescription(data.summary || "");
    setSelectedIconId(data.icon_key || "brain");

    const normalize = (val) => {
      if (Array.isArray(val)) return val.flat(Infinity).join(" ");
      if (val == null) return "";
      return String(val);
    };

    const rulesArray = Object.entries(data.directives || {}).flatMap(
      ([type, arr], i) => {
        if (!Array.isArray(arr)) return [];

        return arr.map((item, index) => ({
          id: i * 100 + index,
          type,
          text: normalize(item)
        }));
      }
    );

    setRules(rulesArray.length ? rulesArray : [{ id: 1, type: "ignore", text: "" }]);
    setIsFetching(false);
  };

  load();
}, [setId, tenant_ID, fetchLearningSetById]);

  const addRule = () => {
    setRules([...rules, { id: Date.now(), type: 'ignore', text: '' }]);
  };

  const removeRule = (id: number) => {
    setRules(rules.filter(r => r.id !== id));
  };

  const updateRule = (id: number, field: string, value: string) => {
    setRules(rules.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

const handleSave = async () => {
  const validationError =!protocolTitle.trim() ? "Title is required." : null;

if (validationError) {
  toast.error("Title is required.", {
  style: {
    background: "#ef4444",
    color: "white"
  }
});
  return;
}
  setSaveStatus("saving");
  setErrorMessage("");

  if (!tenant_ID) {
    setErrorMessage("Tenant ID is not available.");
    setSaveStatus("error");
    return;
  }

  const directives = rules.reduce((acc, rule) => {
  if (!acc[rule.type]) acc[rule.type] = [];
  acc[rule.type].push(rule.text);
  return acc;
}, {} as Record<string, string[]>);

  const payload = {
    title: protocolTitle,
    summary: protocolDescription,
    icon_key: selectedIconId,
    directives,
  };
  const result = await saveLearningSet(tenant_ID, setId || null, payload);

  if (result.ok) {
    setSaveStatus("success");
    navigate("/brain");
  } else {
    setSaveStatus("error");
    setErrorMessage("Failed to save the learning set.");
  }
};


  const SelectedIconComponent = ICONS.find(i => i.id === selectedIconId)?.icon || BrainCircuit;


  return (
    <div className="bg-gray-50/50 min-h-screen rounded-xl border border-gray-200 shadow-sm   flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-5">
          <button onClick={() => navigate("/brain")} className="p-2.5 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-900 border border-transparent hover:border-gray-200">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                {setId ? 'Edit Protocol' : 'Create Protocol'}
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">Draft</span>
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">Define ingestion and conflict resolution logic for the Neural Engine.</p>
          </div>
        </div>
        <div className="flex gap-3">
             <button onClick={() => navigate("/brain")} className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                Discard
             </button>
             <button 
                onClick={handleSave} 
                className={`flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 shadow-lg shadow-slate-200 transition-all hover:-translate-y-0.5 ${saveStatus === 'saving' ? 'opacity-70 cursor-not-allowed' : ''}`}
                disabled={saveStatus === 'saving'}
             >
                {saveStatus === 'saving' ? 'Saving...' : <><Save size={18} /> {setId ? 'Update Protocol' : 'Save Protocol'}</>}
             </button>
        </div>
      </div>
      <div className="flex-1 p-8 max-w-5xl mx-auto w-full space-y-8">
        {isFetching ?
        ( <div className="flex items-center justify-center  text-gray-600">
        Loading learning set details...
      </div>) :(
        <>
          {/* Scope Configuration Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                <Settings size={16} className="text-gray-500" />
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Configuration</h3>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-12 gap-8">
                
                {/* Left Col: Inputs */}
                <div className="md:col-span-8 space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Protocol Title</label>
                        <input 
                            type="text" 
                            placeholder="e.g. Master Service Agreement (MSA) v2.0" 
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-gray-900 placeholder:text-gray-400 font-medium" 
                            value={protocolTitle}
                            onChange={(e) => setProtocolTitle(e.target.value)}
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Set Icon</label>
                        <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
                            {ICONS.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setSelectedIconId(item.id)}
                                    title={item.label}
                                    className={`p-3 rounded-lg border flex items-center justify-center transition-all ${
                                        selectedIconId === item.id 
                                        ? 'bg-blue-50 border-blue-500 text-blue-600 ring-2 ring-blue-100' 
                                        : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-600'
                                    }`}
                                >
                                    <item.icon size={20} />
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Description & Context</label>
                        <textarea 
                            rows={3} 
                            placeholder="Describe what this protocol handles (e.g., 'Extracts liability clauses and validates termination dates against the corporate policy corpus.')" 
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none resize-none text-gray-600"
                            value={protocolDescription}
                            onChange={(e) => setProtocolDescription(e.target.value)}
                        ></textarea>
                    </div>
                </div>
                {/* Right Col: Visual Helper */}
                <div className="md:col-span-4 bg-blue-50/50 rounded-xl border border-blue-100 p-6 flex flex-col justify-center items-center text-center space-y-3">
                    <div className="w-20 h-20 bg-white rounded-full shadow-sm border border-blue-100 flex items-center justify-center text-blue-600 mb-2">
                        <SelectedIconComponent size={36} />
                    </div>
                    <h4 className="font-semibold text-blue-900">Neural Context</h4>
                    <p className="text-xs text-blue-700/80 leading-relaxed">
                        This icon will represent this instruction set across the dashboard. The system will use these rules to resolve contradictions in the Knowledge Graph for matching documents.
                    </p>
                </div>
            </div>
        </div>
        {/* Rules Engine Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
             <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between rounded-t-xl">
                <div className="flex items-center gap-2">
                    <Layers size={16} className="text-gray-500" />
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Logic Engine</h3>
                </div>
                <div className="text-xs text-gray-500 font-medium px-2 py-1 bg-white border border-gray-200 rounded-md">
                    {rules.length} Active Rules
                </div>
            </div>
            
            <div className="p-8 bg-gray-50/30 space-y-4">
                {rules.map((rule, index) => (
                    <div key={rule.id} className="group flex gap-4 items-start bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200 relative">
                        {/* Drag Handle (Visual only for now) */}
                        <div className="mt-3 text-gray-300 cursor-grab active:cursor-grabbing hover:text-gray-500">
                            <GripVertical size={20} />
                        </div>
                        
                        {/* Rule Number */}
                        <div className="mt-2.5 w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center flex-shrink-0 border border-gray-200">
                            {index + 1}
                        </div>
                        {/* Type Select */}
                        <div className="w-40 flex-shrink-0">
                             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block pl-1">Action Type</label>
                             <ActionDropdown
                                value={rule.type}
                                onChange={(val) => updateRule(rule.id, 'type', val)}
                             />
                        </div>
                        {/* Logic Input */}
                        <div className="flex-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block pl-1">Instruction Logic</label>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    value={rule.text}
                                    onChange={(e) => updateRule(rule.id, 'text', e.target.value)}
                                    placeholder={
                                        rule.type === 'resolve' ? 'e.g. If conflict found, prefer Source A over Source B...' :
                                        rule.type === 'detect' ? 'e.g. Flag if "Liability Cap" is missing...' :
                                        'e.g. Extract Date as "Termination_Date"...'
                                    }
                                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-sm text-gray-800 placeholder:text-gray-400" 
                                />
                                {/* Helper Icon inside input */}
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none">
                                    {rule.text.length > 5 ? <CheckCircle2 size={16} className="text-emerald-500" /> : <AlertCircle size={16} />}
                                </div>
                            </div>
                        </div>
                        {/* Actions */}
                        <button 
                            onClick={() => removeRule(rule.id)} 
                            className="mt-6 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove Rule"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
                {/* Add Rule Button */}
                <button 
                    onClick={addRule} 
                    className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-medium hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all flex items-center justify-center gap-2 group"
                >
                    <div className="p-1 rounded-full bg-gray-200 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                        <Plus size={16} />
                    </div>
                    Add Next Instruction
                </button>
            </div>
        </div>
        {saveStatus === 'success' && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <CheckCircle2 size={18} />
            Protocol saved successfully!
          </div>
        )}
        {saveStatus === 'error' && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle size={18} />
            Error saving protocol: {errorMessage}
          </div>
        )}
        </>
      )
        }
      
      </div>
    </div>
  );
};
