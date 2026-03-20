import React, { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, Clock, CheckCircle, AlertTriangle, ThumbsUp, ThumbsDown, Eye, Trophy, Pause, ExternalLink, User, Plus, Mail, Upload, Trash, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { OpportunityDetail } from './OpportunityDetail';
import { StageInfoDialog } from './StageInfoDialog';
import { CreateOpportunityDialog } from './CreateOpportunityDialog';
import { Contact } from '../../types/Contact';
import { Opportunity } from '../../types/Opportunity';
import { useOpportunityStore } from '../../store/opportunityStore';
import { cn, getPaginationNumbers, isFunnelOpportunity } from '../../lib/utils';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../ui/pagination';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { BulkUploadOpportunities } from './BulkUploadOpportunities';
import DeleteConfirmationDialog from '../ui/delete-confirmation-dialog';
import { OpportunityFunnel, OpportunityFunnelView } from '../../types/OpportunityFunnelView';

interface OpportunitiesPanelProps {
  contact: Contact;
  onSelectOpportunity?: (opportunity: Opportunity | OpportunityFunnel) => void;
}

export const OpportunitiesPanel = ({ contact, onSelectOpportunity }: OpportunitiesPanelProps) => {
  const { opportunities, loading, loadOpportunity, avgConfidence, verifyOpportunity, currentPage, totalPages, setCurrentPage, totalValue, deleteOpportunity } = useOpportunityStore();
  const [feedbackNotes, setFeedbackNotes] = useState<{ id: string; type: boolean; notes: string } | null>(null);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | OpportunityFunnel | null>(null);
  const [showStageDialog, setShowStageDialog] = useState<{ opportunityId: string; stage: string } | null>(null);
  const [createOppOpen, setCreateOppOpen] = useState(false);
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  console.log(selectedOpportunity, "NOTES");

  useEffect(() => {
    loadOpportunity([{ key_name: "associated_contacts.email", operator: "==", key_value: contact.email }]);
  }, [contact.email, loadOpportunity]);

  const handleOpportunityClick = (opportunity: Opportunity | OpportunityFunnel) => {
    if (onSelectOpportunity) {
      onSelectOpportunity(opportunity);
    } else {
      setSelectedOpportunity(opportunity);
    }
  };

  const getStageColor = (stage: string) => {
    const colors = {
      'discovery': 'bg-blue-100 text-blue-700',
      'qualification': 'bg-yellow-100 text-yellow-700',
      'proposal': 'bg-purple-100 text-purple-700',
      'negotiation': 'bg-orange-100 text-orange-700',
      'closed-won': 'bg-green-100 text-green-700',
      'closed-lost': 'bg-red-100 text-red-700'
    };
    return colors[stage] || 'bg-gray-100 text-gray-700';
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleStatusChange = (opportunityId: string, newStatus: string) => {
    if (['Discovery', 'Qualification', 'Proposal', 'Negotiation', 'Closed-won'].includes(newStatus)) {
      setShowStageDialog({ opportunityId, stage: newStatus });
    }
  };

  const getOpportunityStageIcon = (stage: string) => {
    switch (stage) {
      case 'Discovery':
        return <Mail size={12} className="mr-1" />;
      case 'Qualification':
        return <CheckCircle size={12} className="mr-1" />;
      case 'Proposal':
        return <Pause size={12} className="mr-1" />;
      case 'Negotiation':
        return <TrendingUp size={12} className="mr-1" />;
      case 'Closed-won':
        return <Trophy size={12} className="mr-1" />;
      default:
        return <Mail size={12} className="mr-1" />;
    }
  }

  const getOpportunityStageClass = (stage: string) => {
    switch (stage) {
      case 'Discovery':
        return "text-gray-600 hover:text-gray-700 hover:bg-gray-50";
      case 'Qualification':
        return "text-blue-600 hover:text-blue-700 hover:bg-blue-50";
      case 'Proposal':
        return "text-purple-600 hover:text-purple-700 hover:bg-purple-50";
      case 'Negotiation':
        return "text-orange-600 hover:text-orange-700 hover:bg-orange-50";
      case 'Closed-won':
        return "text-green-600 hover:text-green-700 hover:bg-green-50";
      default:
        return "text-gray-600 hover:text-gray-700 hover:bg-gray-50";
    }
  }

  const handleFeedback = async (id: string, type: boolean) => {
    if (type) {
      await verifyOpportunity(type, id, "");
    }

    setFeedbackNotes({
      id, type, notes: ""
    })
  }

  // console.log(feedbackNotes, "feedbackNotes");

  const handleRejectFeedback = async () => {
    console.log(feedbackNotes, "feedbackNotes");
    if (!feedbackNotes) return;

    await verifyOpportunity(false, feedbackNotes.id, feedbackNotes.notes);
    setFeedbackNotes(null);
  }

  if (selectedOpportunity && !onSelectOpportunity) {
    return (
      <OpportunityDetail
        opportunity={selectedOpportunity}
        onBack={() => setSelectedOpportunity(null)}
        type={isFunnelOpportunity(selectedOpportunity) ? "funnel" : "list"}
      />
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-2 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-semibold text-gray-900">Opportunities</h3>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>

                <Button size="sm" >
                  <Plus size={16} className="mr-2" />
                  New Opportunity
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setCreateOppOpen(true)}>
                  <Plus size={14} className="mr-2" />
                  Add Single Opportunity
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setBulkUploadOpen(true)}>
                  <Upload size={14} className="mr-2" />
                  Bulk Upload (CSV)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {!loading.opportunityLoading && opportunities.length ? (
          <div className="grid grid-cols-3 gap-4 mb-1">
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <DollarSign size={16} className="text-green-600" />
                <span className="text-sm text-gray-600">Total Value</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                ${totalValue.toLocaleString()}
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <TrendingUp size={16} className="text-blue-600" />
                <span className="text-sm text-gray-600">Avg. Confidence</span>
              </div>
              <p className={`text-lg font-semibold ${getConfidenceColor(+avgConfidence)}`}>
                {Math.round(Number(avgConfidence) ?? 0)}%
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle size={16} className="text-orange-600" />
                <span className="text-sm text-gray-600">Active Opps</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {/* {opportunities.filter(opp => opp.userFeedback !== 'rejected' && !['closed-won', 'closed-lost'].includes(opp.stage)).length} */}
                {opportunities.length}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex-1 min-h-0">
        {(!loading.opportunityLoading && opportunities.length) ?
          <ScrollArea className="h-full">
            <div className="p-2">
              <div className="space-y-4">
                {opportunities.map((opportunity) => (
                  <div
                    key={opportunity.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <button
                            onClick={() => handleOpportunityClick(opportunity)}
                            className="font-medium text-blue-600 hover:text-blue-700 hover:underline cursor-pointer flex items-center justify-start space-x-1"
                          >
                            <span className='text-left'>{opportunity.title}</span>
                            <ExternalLink size={14} />
                          </button>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStageColor(opportunity.stage)}`}>
                            {opportunity.stage.replace('-', ' ')}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpportunityClick(opportunity)}
                            className="text-blue-600 hover:text-blue-700 p-1 gap-1"
                          >
                            <Eye size={14} />
                            View Sources
                          </Button>
                          <Button className='ml-auto text-destructive' variant="ghost" onClick={() => setDeleteId(opportunity.id)}>
                            <Trash2 />
                          </Button>
                        </div>

                        <p className="text-sm text-gray-600 mb-2">{opportunity.summary}</p>

                        <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                          <span className="flex items-center space-x-1">
                            {/* <DollarSign size={12} /> */}
                            <span>{opportunity.currency} &nbsp;
                              {opportunity.money.toLocaleString()}
                            </span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Clock size={12} />
                            <span>Close: {new Date(opportunity.expected_close_date).toLocaleDateString()}</span>
                          </span>
                        </div>

                        {/* Assignment Section */}
                        <div className="mb-3">
                          <div className="flex items-center space-x-2">
                            <User size={12} className="text-gray-500" />
                            <span className="text-xs text-gray-600">Assigned to:</span>
                            <p className='text-xs text-black capitalize'>{contact.name}</p>
                          </div>
                        </div>

                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-600">Confidence Score</span>
                            <span className={`text-xs font-medium ${getConfidenceColor(opportunity.confidence_score)}`}>
                              {opportunity.confidence_score}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${opportunity.confidence_score >= 80 ? 'bg-green-500' :
                                opportunity.confidence_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                              style={{ width: `${opportunity.confidence_score}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="mb-3">
                          <h5 className="text-xs font-medium text-gray-600 mb-1">Maturity Indicators:</h5>
                          <div className="flex flex-wrap gap-1">
                            {opportunity.maturity_indicators_passed.map((indicator, idx) => (
                              <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                                {indicator}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="text-xs text-gray-500">
                          <div className='flex gap-1'>Source:
                            {opportunity.source.map((src, i) => (
                              <p className='capitalize' key={i}>{src?.source}</p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {!['closed-won', 'closed-lost'].includes(opportunity.stage) && (
                      <div className="border-t border-gray-100 pt-3 mb-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-600 font-medium">Update Status:</span>
                          <div className="flex items-center space-x-1">
                            {opportunity.configured_stages.map(stage => {
                              return (
                                <Button
                                  key={stage.name}
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleStatusChange(opportunity.id, stage.name)}
                                  className={cn("text-xs px-2 py-1 h-7", getOpportunityStageClass(stage.name))}
                                >
                                  {getOpportunityStageIcon(stage.name)}
                                  {stage.name}
                                </Button>
                              )
                            }
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="border-t border-gray-100 pt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Is this a real opportunity?</span>
                        <div className="flex items-center space-x-2">
                          {!opportunity.opportunity_verified ? (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleFeedback(opportunity.id, true)}
                                className="text-green-600 hover:text-green-700"
                              >
                                <ThumbsUp size={14} className="mr-1" />
                                Yes
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleFeedback(opportunity.id, false)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <ThumbsDown size={14} className="mr-1" />
                                No
                              </Button>
                            </>
                          ) : (
                            <div className="flex items-center space-x-2">
                              {opportunity.opportunity_verified && (
                                <span className="flex items-center text-green-600 text-xs">
                                  <CheckCircle size={14} className="mr-1" />
                                  Confirmed
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {feedbackNotes?.id === opportunity.id && !feedbackNotes.type && (
                        <>
                          <div className="mt-2">
                            <input
                              type="text"
                              placeholder="Add feedback notes (optional)"
                              value={feedbackNotes?.notes || ''}
                              onChange={(e) => setFeedbackNotes(prev => ({
                                ...prev,
                                notes: e.target.value
                              }))}
                              className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                          <div className='flex justify-end gap-2 mt-2'>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setFeedbackNotes(null)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleRejectFeedback}
                              className="text-green-600 hover:text-green-700"
                            >
                              Save
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {totalPages > 1 &&
              <Pagination className='p-2 sticky bottom-0 bg-white'>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)} disabled={currentPage === 1 || loading.listviewOpportunitiesLoading} />
                  </PaginationItem>
                  {getPaginationNumbers(currentPage, totalPages).map((page, index) => (
                    <PaginationItem key={index}>
                      {
                        page === "..." ? <PaginationEllipsis /> : (<PaginationLink isActive={currentPage === page} onClick={() => setCurrentPage(page)}>
                          {page}
                        </PaginationLink>)
                      }
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages || loading.listviewOpportunitiesLoading} />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            }
          </ScrollArea> : null
        }
        {loading.opportunityLoading && (
          <div className="flex justify-center items-center h-full">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
            Loading...
          </div>
        )}
        {(!loading.opportunityLoading && !opportunities.length) && (
          <div className="w-full h-full text-center text-gray-500 py-8">
            <p className="text-lg font-medium mb-2">There are no opportunities found!</p>
          </div>
        )}
      </div>

      <StageInfoDialog
        open={!!showStageDialog}
        onOpenChange={setShowStageDialog}
        stage={showStageDialog}
      />

      <CreateOpportunityDialog
        open={createOppOpen}
        onOpenChange={setCreateOppOpen}
        contact={contact}
      />

      <BulkUploadOpportunities open={bulkUploadOpen} onOpenChange={setBulkUploadOpen} contact={contact} />
      <DeleteConfirmationDialog
        title="Delete Opportunity"
        description="Are you sure you want to delete this opportunity?"
        keyword="DELETE"
        buttonText="Delete"
        loading={loading.deletingOpportunity}
        openDeleteDialog={!!deleteId}
        handleCloseModal={() => setDeleteId(null)}
        handleDelete={() =>
          deleteOpportunity(deleteId)
        }
      />
    </div>
  );
};
