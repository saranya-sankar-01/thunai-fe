import React, { useEffect, useState } from 'react';
import { Shield, FileBarChart, Code2, Scale, GitBranch, Play, CheckCircle2, AlertCircle, Edit, Trash2, Loader2, RefreshCcw, XCircle } from 'lucide-react'; // Added Edit and Trash2
import { ExplorerStream } from '../ExplorerStream'; // Assuming ExplorerStream is in a separate file
// import { useProcessStatus } from '@/store/useProcessStream';
import { useLearningSets } from '@/store/useLearningSets';
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  ArrowLeft, Plus, Save, BrainCircuit, FileText, Settings, 
  GripVertical,  
  BookOpen, Database, Cpu, Zap, Globe, Network, Briefcase, 
  GraduationCap, Lightbulb, Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VersionHistory } from './VersionHistory';
import { Switch } from '@/components/ui/switch';
import usePermissions from '@/hooks/usePermissions';
import { DeleteConfirmationDialog } from '../shared-components/DeleteConfirmationDialog';
import { getTenantId } from '@/services/authService';

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

export const LearningSetsView = ({ onCreate, onViewHistory, setLastActiveTab,processes }) => {
  const tenantID = getTenantId()
const [refreshing, setRefreshing] = useState(false);
  const [selectedHistoryId, setSelectedHistoryId] = useState(null);
//   const { processes, refetch } = useProcessStatus(tenantID);
  const navigate = useNavigate();
  const { learningSets, loading, deletingId, fetchLearningSets, deleteLearningSet, saveLearningSet } = useLearningSets();
const [updatingId,setUpdatingId] = useState(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [setToDelete, setSetToDelete] = useState(null);
  // Permission management
  // const permissions = JSON.parse(localStorage.getItem('permissions') || '[]');
  // const hasFullAccess = permissions.includes('*') || permissions.includes('knowledgegraph_memory:ALL');
  // const hasReadAccess = permissions.includes('knowledgegraph_memory:READ');
  // const canModify = hasFullAccess;
  // const canView = hasFullAccess || hasReadAccess;
const { canViewModule, canModifyModule } = usePermissions();
const canModify = canModifyModule("knowledgegraph_memory");

  useEffect(() => {
    fetchLearningSets(tenantID);
  }, [tenantID]);

  const handleCreate = () => {
    setLastActiveTab("learning-sets");
    navigate("/brain/create-learningset");
  };

  const handleEdit = (setId) => {
    setLastActiveTab("learning-sets");
    navigate(`/brain/edit-learningset/${setId}`); 
  };

  const handleDeleteClick = (set) => {
    setSetToDelete(set);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (setToDelete) {
      await deleteLearningSet(tenantID, setToDelete.id);
      setIsDeleteDialogOpen(false);
      setSetToDelete(null);
    }
  };


const handleRefresh = async () => {
  setRefreshing(true);
  await fetchLearningSets(tenantID);
  setRefreshing(false);
};
const handleViewHistory = async (id) =>{
  setSelectedHistoryId(id)
}

  const handleStatusToggle = async (set, checked) => {
      setUpdatingId(set.id);
    const newStatus = checked ? 'active' : 'inactive';
    const payload:any = {
      status: newStatus
    };
    const result = await saveLearningSet(tenantID, set.id, payload);
    if (result.ok) {
      await  fetchLearningSets(tenantID);
    }
       setUpdatingId(null);
  };

  return (
    <div className="space-y-4 flex gap-6 "> {/* Added flex container for two columns */}
      <div className="pt-3 flex-grow space-y-6 animate-in fade-in duration-500 h-[calc(100vh-230px)] overflow-y-auto"> {/* Existing content in left column */}
     {selectedHistoryId ? (
    <VersionHistory
      setId={selectedHistoryId}
      onBack={() => setSelectedHistoryId(null)}
    />
  ) : (
    <>
    <div className="flex items-center justify-between">
  <div>
    <h2 className="text-base md:text-2xl font-bold text-foreground">Brain Instruction Sets</h2>
    <p className="text-sm text-gray-500">Manage how the AI interprets and resolves contradictions per file category.</p>
  </div>

  <div className="flex items-center gap-3">
    {/* Refresh Button */}
    <Button size='sm'
    variant='outline'
      onClick={handleRefresh}
    >
      <RefreshCcw size={16} />
    </Button>

    {/* Branch New Set - Only show if user can modify */}
    {canModify && (
    <button
      onClick={handleCreate}
      className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
    >
      <GitBranch size={16} />
      Branch New Set
    </button>
    )}
  </div>
</div>


        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
       {refreshing ? (
  <div className="col-span-full flex flex-col justify-center items-center py-20 gap-3">
    <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
    <p className="text-gray-600 text-sm mt-2">Refreshing learning sets...</p>
  </div>
) : loading && learningSets.length === 0 ? (
          <div className="col-span-full flex justify-center items-center py-10">
  <p className="text-gray-500">Loading learning sets...</p>
</div>

          ) : (
            learningSets.map((set) => {
              const IconComponent = ICONS.find(icon => icon.id === set.icon_key)?.icon || BrainCircuit;
              return (
              <div key={set.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
              <div
          key={set.id}
          className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col"
          style={{ height: '330px' }} // Fixed card height
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r to-white">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg group-hover:scale-110 transition-transform">
                <IconComponent size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">{set.title}</h3>
              <div className="flex items-center gap-2">
  <span
    className={`flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider ${
      set.status === "retraining"
        ? "text-orange-600"
        : set.status === "inactive"
        ? "text-gray-500"
        : "text-emerald-600"
    }`}
  >
    {set.status === "retraining" ? (
      <>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
          <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500"></span>
        </span>
        Retraining
      </>
    ) : set.status === "inactive" ? (
      <>
        <XCircle size={12} /> Inactive
      </>
    ) : (
      <>
        <CheckCircle2 size={12} /> Active
      </>
    )}
  </span>
</div>

              </div>
            </div>
            <div className="text-right flex flex-col items-end gap-1">
              <div className="flex items-center gap-2">
                  {updatingId === set.id ? (
                    <Loader2 size={14} className="animate-spin text-blue-600 mr-3" />
                ) : (
                    <Switch 
                    checked={set.status === 'active'}
                    onCheckedChange={(checked) => handleStatusToggle(set, checked)}
                    disabled={set.status === 'retraining' || !canModify}
                    />
                )}
                <div className="text-xs font-mono text-gray-400">{set.version}</div>          
              </div>
              <div className="text-sm font-bold text-gray-700">{set.accuracy}</div>
            </div>
          </div>

          {/* Rules List with scroll */}
<div className="p-5 space-y-4 bg-white flex-1 overflow-y-auto">
  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
    <Shield size={12} /> Active Directives
  </div>
  <ul className="space-y-3">
    {Object.entries(set.directives || {})
      .filter(([_, val]) => val !== null && val !== "" && !(Array.isArray(val) && val.length === 0))
      .flatMap(([key, val]) => {
        const items = Array.isArray(val) ? val : [val]; // 👈 convert to array always
        return items.map((item, i) => (
          <li key={`${key}-${i}`} className="flex gap-3 text-xs text-gray-600 leading-relaxed group/item">
            <span
              className={`mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono h-fit border ${
                key === 'resolve'
                  ? 'bg-orange-50 text-orange-700 border-orange-100'
                  : key === 'detect'
                  ? 'bg-blue-50 text-blue-700 border-blue-100'
                  : 'bg-gray-100 text-gray-700 border-gray-200'
              }`}
            >
              {key}
            </span>

            <span className="group-hover/item:text-gray-900 transition-colors">
              {item}
            </span>
          </li>
        ));
      })}
  </ul>
</div>



          

          
                 <div className="bg-gray-50 px-5 py-3 border-t border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-3"> {/* Group edit and delete buttons */}
                        {canModify && (
                          <>
                        <button
                            onClick={() => handleEdit(set.id)}
                            className="text-xs font-medium text-gray-500 hover:text-blue-600 flex items-center gap-1 transition-colors p-1.5 rounded-md hover:bg-blue-50"
                            title="Edit Learning Set"
                        >
                            <Edit size={14} /> Edit
                        </button>
                        <button
  onClick={() =>handleDeleteClick(set)}
  disabled={deletingId === set.id}
  className={`text-xs font-medium flex items-center gap-1 p-1.5 rounded-md transition-colors 
    ${deletingId === set.id 
      ? "text-gray-400 cursor-not-allowed" 
      : "text-gray-500 hover:text-red-600 hover:bg-red-50"
    }`}
  title="Delete Learning Set"
>
  {deletingId === set.id ? (
    <Loader2 size={14} className="animate-spin" />
  ) : (
    <>
      <Trash2 size={14} /> Delete
    </>
  )}
</button>
                          </>
                        )}
                    </div>
                    <button
                        onClick={() => handleViewHistory(set.id)}
                        className="text-xs font-medium text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors"
                    >
                       View History
                    </button>
                    {canModify && (
                    <button 
                    className={`p-1.5 rounded-md transition-colors ${set.status === 'retraining' ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-blue-600 shadow-sm'}`}>
                       <Play size={14} fill={set.status === 'active' ? "currentColor" : "none"} />
                    </button>
                    )}
                 </div>
                 </div>
              </div>
            );
         }))}
     
       {!loading && canModify && (
  <div
    onClick={handleCreate}
    className="border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center p-8 text-gray-400 hover:border-blue-300 hover:bg-blue-50/30 transition-all cursor-pointer group"
  >
      <div className="p-4 bg-gray-50 rounded-full mb-3 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
          <GitBranch size={24} />
      </div>
      <p className="font-medium text-gray-600 group-hover:text-blue-700">Define New Set</p>
      <p className="text-xs text-center mt-1 max-w-[200px]">
        Create custom learning rules for specific document types.
      </p>
  </div>
)}

        </div>
        </>
  )}
      </div>
  <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSetToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Learning Set"
        description={`Are you sure you want to delete "${setToDelete?.title}"? This action cannot be undone.`}
        isDeleting={deletingId === setToDelete?.id}
      />
      {/* <div className="w-1/3 max-w-sm flex-shrink-0  flex flex-col" style={{ height: 'calc(100vh - 240px)' }}>
        <ExplorerStream processes={processes}  />
      </div> */}
    </div>
  );
};
