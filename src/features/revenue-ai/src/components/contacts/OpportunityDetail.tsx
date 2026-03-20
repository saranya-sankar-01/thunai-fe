import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  DollarSign,
  TrendingUp,
  User,
  Lock,
  Globe,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Users,
  Calendar,
  MessageSquare,
  FileText,
  Phone,
  Mail,
  UserCheck,
  Trash2,
  Brain,
  Activity,
  Merge
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StageInfoDialog } from './StageInfoDialog';
import { ConversationTimeline } from './ConversationTimeline';
import { UpdateTimeline } from './UpdateTimeline';
import { ActionItemsPanel } from './ActionItemsPanel';
import { AIAssistant } from './AIAssistant';
import { OpportunitySelectionDialog } from './OpportunitySelectionDialog';
import { OpportunityMergeDialog } from './OpportunityMergeDialog';
import { useToast } from '@/hooks/use-toast';
import { Opportunity } from '../../types/Opportunity';
import { useUserManagementStore } from '../../store/userManagementStore';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { getInitials, isFunnelOpportunity } from '../../lib/utils';
import { Contact } from '../../types/Contact';
import { useOpportunityStore } from '../../store/opportunityStore';
import DeleteConfirmationDialog from '../ui/delete-confirmation-dialog';
import { OpportunityFunnel, OpportunityFunnelView } from '../../types/OpportunityFunnelView';

interface OpportunityDetailProps {
  opportunity: Opportunity | OpportunityFunnel;
  onBack: () => void;
  type: "list" | "funnel"
}

interface OpportunitySource {
  id: string;
  type: 'email' | 'meeting' | 'call' | 'chat';
  title: string;
  content: string;
  timestamp: string;
  participants: string[];
  relevantExcerpt: string;
  owner: string;
  hasAccess: boolean;
}

export const OpportunityDetail = ({ opportunity, onBack, type }: OpportunityDetailProps) => {
  const [localOpportunity, setLocalOpportunity] = useState<Opportunity | null>(null);
  const [showStageDialog, setShowStageDialog] = useState<{ opportunityId: string; stage: string } | null>(null);
  const [showSelectionDialog, setShowSelectionDialog] = useState(false);
  const [showMergeDialog, setShowMergeDialog] = useState(false);
  const [selectedOpportunities, setSelectedOpportunities] = useState<Opportunity[]>([]);
  const [sourceToDelete, setSourceToDelete] = useState<string | null>(null)
  const { deletingOpportunitySource, loading, loadOpportunity, opportunities } = useOpportunityStore();

  console.log("localOpportunity", opportunity);
  console.log("opportunity type", isFunnelOpportunity(opportunity) ? "funnel" : "list");
  console.log("Total Opportunities", opportunities);

  const getSourceIcon = (type: string) => {
    const icons = {
      email: Mail,
      meeting: Calendar,
      call: Phone,
      chat: MessageSquare
    };
    return icons[type] || MessageSquare;
  };

  const getSourceColor = (type: string) => {
    const colors = {
      email: 'bg-blue-100 text-blue-600',
      meeting: 'bg-green-100 text-green-600',
      call: 'bg-yellow-100 text-yellow-600',
      chat: 'bg-purple-100 text-purple-600'
    };
    return colors[type] || 'bg-gray-100 text-gray-600';
  };

  const handleMergeClick = () => {
    setShowSelectionDialog(true);
  };

  const handleOpportunitiesSelected = (selectedOpps: Opportunity[]) => {
    setSelectedOpportunities(selectedOpps);
    setShowSelectionDialog(false);
    setShowMergeDialog(true);
  };

  useEffect(() => {
    console.log("USEEFFECT TRIGGERED")
    if (type === "list") {
      console.log("LIST")
      setLocalOpportunity(opportunity as Opportunity)
    }
    if (type === "funnel") {
      setLocalOpportunity(null);
      const funnelOpportunity = opportunity as OpportunityFunnel;
      console.log(funnelOpportunity, "funnelOpportunity");
      loadOpportunity([{
        key_name: '_id',
        key_value: funnelOpportunity.opportunity_id,
        operator: "=="
      }]);
    }
  }, [type, opportunity, loadOpportunity]);

  useEffect(() => {
    if (type === "funnel" && opportunities.length > 0) {
      setLocalOpportunity(opportunities[0]);
    }
  }, [opportunities, type]);

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-gray-200 flex-shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          className="flex items-center space-x-2"
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </Button>
        {type === "funnel" && loading.opportunityLoading && (
          <div className="flex justify-center items-center h-screen">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
            Loading...
          </div>)}
        {localOpportunity &&
          <>
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1 mb-1">
                  <h1 className="text-xl font-bold text-gray-900">{localOpportunity?.title}</h1>
                  {/* {opportunity.type === 'public' ? (
                  <Globe size={14} className="text-green-600" />
                ) : (
                  <Lock size={14} className="text-orange-600" />
                )} */}
                  {/* <span className={`text-xs px-2 py-1 rounded ${opportunity.type === 'public'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-orange-100 text-orange-700'
                  }`}>
                  {opportunity.type}
                </span> */}
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center space-x-1">
                    {/* <DollarSign size={14} /> */}
                    <span>{localOpportunity?.currency} {localOpportunity?.money?.toLocaleString()}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <TrendingUp size={14} />
                    <span>{localOpportunity?.confidence_score}% confidence</span>
                  </span>
                </div>
              </div>
            </div>

            <p className="text-gray-600 mb-2">{localOpportunity?.summary}</p>


            {/* Assignment Section */}
            <div className="mb-2 p-2 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-1">Assignment</h3>
              <div className="flex items-center space-x-2">
                <User size={16} className="text-gray-500" />
                <span className="text-sm text-gray-600">Assigned to:</span>
                <p className='text-xs text-black capitalize'>{localOpportunity?.assignee?.assignee_name ?? "Unassigned"}</p>
              </div>
            </div>

            {/* Status and Merge Actions */}
            <div className="flex items-center space-x-2 mb-4">
              {opportunity.stage !== 'Closed-won' && (
                <Button
                  size="sm"
                  onClick={() => setShowStageDialog({ opportunityId: localOpportunity?.id, stage: "Closed-won" })}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Mark as Won
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleMergeClick}
                className="flex items-center gap-2"
              >
                <Merge className="h-4 w-4" />
                Merge with Others
              </Button>
            </div>

            {/* Associated Contacts */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <Users size={16} className="mr-2" />
                Associated Contacts ({localOpportunity?.associated_contacts?.length || 0})
              </h3>
              <div className="flex flex-wrap gap-2">
                {localOpportunity?.associated_contacts?.slice(0, 3).map((contact, index) => (
                  <div key={index} className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg p-2 hover:shadow-sm">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                      {getInitials(contact.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-medium text-gray-900 truncate">{contact.name}</h4>
                      <p className="text-xs text-gray-500 truncate">{contact.email}</p>
                    </div>
                  </div>
                ))}
                {localOpportunity?.associated_contacts?.length > 5 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div className="flex items-center space-x-2 rounded-lg p-2">
                        <h4 className="text-sm font-medium text-blue-700 cursor-pointer truncate">{localOpportunity?.associated_contacts?.length - 5} more</h4>
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-white max-h-[400px] overflow-y-auto">
                      {localOpportunity?.associated_contacts?.slice(5).map((contact, index) => (
                        <DropdownMenuItem key={index}>
                          <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg p-2 w-full hover:shadow-sm">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                              {getInitials(contact.name)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="text-sm font-medium text-gray-900 truncate">{contact.name}</h4>
                              <p className="text-xs text-gray-500 truncate">{contact.email}</p>
                            </div>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                )}
                {(!localOpportunity?.associated_contacts || localOpportunity?.associated_contacts.length === 0) && (
                  <p className="text-sm text-gray-500 italic">No associated contacts found</p>
                )}
              </div>
            </div>

            <h3 className="text-sm font-medium text-gray-600 mb-1">Maturity Indicators:</h3>
            <div className="flex flex-wrap gap-1">
              {localOpportunity?.maturity_indicators_passed?.map((indicator, idx) => (
                <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                  {indicator}
                </span>
              ))}
            </div>


          </>
        }
      </div>
      {/* Tabs for different views */}
      {localOpportunity && (
        <Tabs defaultValue="sources" className="flex-1 flex flex-col min-h-0">
          <TabsList className="w-full justify-start border-b border-gray-200 bg-transparent rounded-none h-auto p-0 flex-shrink-0 px-6">
            <TabsTrigger value="sources" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none bg-transparent">
              <FileText size={16} className="mr-2" />
              Sources ({localOpportunity?.source?.length})
            </TabsTrigger>
            <TabsTrigger value="timeline" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none bg-transparent">
              <Activity size={16} className="mr-2" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none bg-transparent">
              <MessageSquare size={16} className="mr-2" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="actions" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none bg-transparent">
              <Calendar size={16} className="mr-2" />
              Actions
            </TabsTrigger>
            <TabsTrigger value="ai" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none bg-transparent">
              <Brain size={16} className="mr-2" />
              AI Assistant
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 min-h-0 overflow-hidden">
            <TabsContent value="sources" className="h-full m-0 overflow-hidden">
              <div className="h-full overflow-y-auto">
                <div className="flex-1 min-h-0 overflow-auto p-2">
                  <div className="space-y-4">
                    {localOpportunity?.type === 'private' ? (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 text-center">
                        <Lock size={24} className="mx-auto mb-2 text-orange-600" />
                        <h4 className="font-medium text-orange-900 mb-1">Private Sources</h4>
                        <p className="text-sm text-orange-700">
                          Source details are private and only visible to you. Enable "Make sources public" to share with your team.
                        </p>
                      </div>
                    ) : (
                      localOpportunity?.source?.map((source, index) => {
                        const IconComponent = getSourceIcon(source.source_from);

                        return (
                          <div
                            key={index}
                            className={`bg-white border border-gray-200 rounded-lg p-4 transition-all ${source.user_has_access
                              ? 'hover:shadow-md cursor-pointer'
                              : 'hover:shadow-md cursor-pointer border-orange-200 bg-orange-50/50'
                              }`}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center space-x-3 flex-1">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getSourceColor(source?.source_from)}`}>
                                  <IconComponent size={16} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <h4 className="font-medium text-gray-900 truncate">{source?.source}</h4>
                                    {!source?.user_has_access && (
                                      <Lock size={14} className="text-orange-600 flex-shrink-0" />
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-500 truncate">
                                    {source?.date} • {source?.owner?.name}
                                  </p>
                                  <div className="flex items-center space-x-1 mt-1">
                                    <UserCheck size={12} className="text-gray-400" />
                                    <span className="text-xs text-gray-500">Owner: {source?.owner?.name}</span>
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSourceToDelete(source.sale_id);
                                }}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>

                            <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-3">
                              <h5 className="text-xs font-medium text-blue-900 mb-1">Relevant Excerpt:</h5>
                              <p className="text-sm text-blue-800 italic">"{source?.excerpt}"</p>
                            </div>

                            <div className="flex items-center justify-between">
                              <p className="text-xs text-gray-500 flex-1">
                                Source: {source?.source_from}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="timeline" className="h-full m-0 overflow-hidden">
              <UpdateTimeline opportunity={localOpportunity} />
            </TabsContent>

            <TabsContent value="activity" className="h-full m-0 overflow-hidden">
              <ConversationTimeline opportunity={localOpportunity} />
            </TabsContent>

            <TabsContent value="actions" className="h-full m-0 overflow-hidden">
              <ActionItemsPanel opportunity={localOpportunity} />
            </TabsContent>

            <TabsContent value="ai" className="h-full m-0 overflow-hidden">
              <AIAssistant opportunity={localOpportunity} />
            </TabsContent>
          </div>
        </Tabs>
      )}

      <StageInfoDialog
        open={!!showStageDialog}
        onOpenChange={setShowStageDialog}
        stage={showStageDialog}
      />

      {/* Opportunity Selection Dialog */}
      <OpportunitySelectionDialog
        isOpen={showSelectionDialog}
        onClose={() => setShowSelectionDialog(false)}
        currentOpportunity={localOpportunity}
        onSelect={handleOpportunitiesSelected}
      />

      {/* Merge Instructions Dialog */}
      <OpportunityMergeDialog
        isOpen={showMergeDialog}
        onClose={() => {
          setShowMergeDialog(false);
          setSelectedOpportunities([]);
        }}
        selectedOpportunities={selectedOpportunities}
      />

      <DeleteConfirmationDialog
        title="Delete Source"
        description="Are you sure you want to delete this source?"
        keyword="DELETE"
        buttonText="Delete"
        loading={loading.deletingOpportunitySource}
        openDeleteDialog={!!sourceToDelete}
        handleCloseModal={() => setSourceToDelete(null)}
        handleDelete={() =>
          deletingOpportunitySource(localOpportunity.id, sourceToDelete)
        }
      />
    </div>
  );
};