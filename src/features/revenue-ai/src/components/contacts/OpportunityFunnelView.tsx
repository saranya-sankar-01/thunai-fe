import React, { useEffect, useRef, useState } from 'react';
import { Brain, Calendar, ChevronLeft, ChevronRight, Filter, TrendingUp, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ThunaiStageAnalysis } from './ThunaiStageAnalysis';
import { useOpportunityStore } from '../../store/opportunityStore';
import { useUserManagementStore } from '../../store/userManagementStore';
import { Opportunity } from '../../types/Opportunity';

type OpportunityFunnelViewProps = {
  onSelectOpportunity?: (opportunity: Opportunity) => void;
}

export const OpportunityFunnelView: React.FC<OpportunityFunnelViewProps> = ({ onSelectOpportunity }) => {
  const { funnelviewOpportunities, loadFunnelviewOpportunities, loading, updateOpportunityStage } = useOpportunityStore();
  const { users } = useUserManagementStore();
  const [selectedOwner, setSelectedOwner] = useState<string>('all');
  const [draggedOpportunity, setDraggedOpportunity] = useState<Opportunity | null>(null);
  const [thunaiDialogOpen, setThunaiDialogOpen] = useState(false);
  const [selectedStageForAnalysis, setSelectedStageForAnalysis] = useState<string | null>(null);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadFunnelviewOpportunities();
  }, [loadFunnelviewOpportunities]);

  const opportunities = Object.entries(funnelviewOpportunities).map(([stageName, data]) => {
    return {
      stageName,
      ...data
    }
  });

  // console.log(selectedOpportunity);

  // Get unique owners from opportunities
  // const owners = [...new Set(opportunities.map(opp => opp.assignedTo).filter(Boolean))];

  // Filter opportunities by selected owner
  // const filteredOpportunities = selectedOwner === 'all'
  //   ? opportunitiess
  //   : opportunitiess.filter(opp => opp.owner === selectedOwner);

  const getOpportunitiesByStage = (stageName: string) => {
    return opportunities.find(opp => opp["stageName"] === stageName);
  };

  // const getTotalValue = (stageOpportunities: Opportunity[]) => {
  //   return stageOpportunities.reduce((sum, opp) => sum + opp.value, 0);
  // };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-700';
    if (score >= 60) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  const handleDragStart = (e: React.DragEvent, opportunity: Opportunity) => {
    setDraggedOpportunity(opportunity);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetStage: string) => {
    e.preventDefault();
    if (draggedOpportunity && draggedOpportunity.stage !== targetStage) {
      updateOpportunityStage(draggedOpportunity.opportunity_id, { stage: targetStage });
      loadFunnelviewOpportunities();
    }
    setDraggedOpportunity(null);
  };

  const handleDragEnd = () => {
    setDraggedOpportunity(null);
  };

  const handleThunaiAnalysis = (stageName: string) => {
    if (!stageName) return;
    setSelectedStageForAnalysis(stageName);
    setThunaiDialogOpen(true);
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col h-full p-2">
      {/* Header and Navigation - viewport width */}
      <div className="flex-shrink-0 space-y-4 mb-4 pr-1">
        {/* Header with Filter and Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Pipeline Board</h2>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedOwner} onValueChange={setSelectedOwner}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by owner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Owners</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id || ''}>
                    {user.name || 'Unassigned'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Horizontal Scroll Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={scrollLeft}
            className="flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Scroll Left
          </Button>
          <div className="text-sm text-muted-foreground">
            Use arrows to navigate pipeline stages horizontally
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={scrollRight}
            className="flex items-center gap-1"
          >
            Scroll Right
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Kanban Board - Only this scrolls horizontally */}
      {loading.funnelviewOpportunitiesLoading ? (
        <div className="flex justify-center items-center h-full">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
          Loading...
        </div>
      ) : (
        <div ref={scrollContainerRef} className='flex gap-4 overflow-x-auto pb-4'>
          <div className="flex-shrink-0 w-80">
            <div className="flex gap-4 h-full min-w-max overflow-x-auto">
              {opportunities.map((stage) => {
                const stageOpportunities = getOpportunitiesByStage(stage["stageName"]);
                // const totalValue = getTotalValue(stageOpportunities);

                // console.log(stageOpportunities.opportunities);

                return (
                  <div
                    key={stage["stageName"]}
                    className="flex-shrink-0 w-80 h-full flex flex-col bg-gray-50/50 rounded-lg border border-gray-100"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, stage["stageName"])}
                  >
                    {/* Column Header */}
                    <div className="p-3 bg-gray-50 border-b flex-shrink-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-gray-700">{stage["stageName"]}</span>
                          <Badge variant="secondary" className="text-[10px] px-1.5 h-4">
                            {stageOpportunities.count}
                          </Badge>
                        </div>
                        <div className="text-[11px] text-gray-500 font-medium">
                          ${stageOpportunities.total_money.toLocaleString()}
                        </div>
                      </div>

                      {/* Ask Thunai Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleThunaiAnalysis(stage["stageName"])}
                        className="w-full text-xs h-8 flex items-center gap-1"
                      >
                        <Brain className="h-3 w-3" />
                        Ask Thunai
                      </Button>
                    </div>

                    {/* Opportunity Cards - internal vertical scroll */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0 bg-transparent">
                      {stageOpportunities?.opportunities?.map((opportunity) => (
                        <Card
                          key={opportunity.opportunity_id}
                          className="hover:shadow-lg transition-all duration-200 cursor-move border border-gray-200/60 bg-white group"
                          draggable
                          onDragStart={(e) => handleDragStart(e, opportunity)}
                          onDragEnd={handleDragEnd}
                        >
                          <CardContent className="p-3">
                            <div className="space-y-3">
                              <div className="flex items-start gap-2.5">
                                <h3 className="font-semibold text-xs leading-tight line-clamp-2 text-gray-800 flex-1 group-hover:text-primary transition-colors" role="button" onClick={() => onSelectOpportunity(opportunity)}>
                                  {opportunity.title}
                                </h3>
                              </div>

                              <div className="flex items-center justify-between gap-1">
                                <div className="flex items-center gap-1 text-green-600 font-bold">
                                  {/* <DollarSign className="h-3 w-3" /> */}
                                  <span className="text-[11px]">{opportunity.currency}&nbsp;{opportunity.money.toLocaleString()}</span>
                                </div>
                                <Badge
                                  variant="secondary"
                                  className={`text-[9px] px-1.5 py-0 h-4 border-none font-bold ${getConfidenceColor(opportunity.confidence_score)}`}
                                >
                                  {opportunity.confidence_score}%
                                </Badge>
                              </div>

                              <div className="pt-2 border-t border-gray-50 flex flex-col gap-1.5">
                                {opportunity.expected_close_date &&
                                  <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                                    <Calendar className="h-3 w-3 opacity-70" />
                                    <span>{formatDate(opportunity?.expected_close_date)}</span>
                                  </div>
                                }


                                {opportunity.owner && (
                                  <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                                    <User className="h-3 w-3 opacity-70" />
                                    <span className="truncate">{opportunity.owner}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}


                      {stageOpportunities?.opportunities?.length === 0 && (
                        <div className="text-center text-gray-400 text-[10px] py-10 border-2 border-dashed border-gray-100 rounded-lg">
                          No deals here
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats - viewport width */}
      {/* <Card className="mt-2 flex-shrink-0 shadow-sm border-gray-100">
        <CardContent className="p-3">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-base font-bold text-primary">{opportunities.length}</div>
              <div className="text-[9px] uppercase tracking-wider font-bold text-gray-400">Total Deals</div>
            </div>
            <div>
              <div className="text-base font-bold text-green-600">
                ${getTotalValue(filteredOpportunities).toLocaleString()}
              </div>
              <div className="text-[9px] uppercase tracking-wider font-bold text-gray-400">Pipeline Value</div>
            </div>
            <div>
              <div className="text-base font-bold text-blue-600">
                {filteredOpportunities.length > 0
                  ? Math.round(filteredOpportunities.reduce((sum, opp) => sum + opp.confidenceScore, 0) / filteredOpportunities.length)
                  : 0}%
              </div>
              <div className="text-[9px] uppercase tracking-wider font-bold text-gray-400">Avg Confidence</div>
            </div>
            <div>
              <div className="text-base font-bold text-purple-600">
                {owners.length}
              </div>
              <div className="text-[9px] uppercase tracking-wider font-bold text-gray-400">Active Owners</div>
            </div>
          </div>
        </CardContent>
      </Card> */}

      {/* Dialogs */}
      <ThunaiStageAnalysis
        isOpen={thunaiDialogOpen}
        onClose={() => setThunaiDialogOpen(false)}
        stage={selectedStageForAnalysis}
      />
    </div>
  );
};