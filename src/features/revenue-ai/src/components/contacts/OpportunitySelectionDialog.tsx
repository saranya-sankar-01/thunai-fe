import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Calendar, Search } from 'lucide-react';
import { useOpportunityStore } from '../../store/opportunityStore';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../ui/pagination';
import { getPaginationNumbers } from '../../lib/utils';
import { useDebounce } from '@/hooks/useDebounce';
import { Opportunity } from '../../types/Opportunity';

interface OpportunitySelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentOpportunity: Opportunity;
  onSelect: (selectedOpps: Opportunity[]) => void;
}

export const OpportunitySelectionDialog: React.FC<OpportunitySelectionDialogProps> = ({
  isOpen,
  onClose,
  currentOpportunity,
  onSelect
}) => {
  const [selected, setSelected] = useState<Set<Opportunity>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const { opportunities, loadOpportunity, loading, totalPages, currentPage, setCurrentPage } = useOpportunityStore();

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    loadOpportunity([], debouncedSearchTerm)
  }, [loadOpportunity, debouncedSearchTerm]);

  // Filter out the current opportunity and filter by search
  const availableOpportunities = opportunities
    .filter(opp => opp.id !== currentOpportunity?.id)
    .filter(opp =>
      opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.summary.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const toggleSelection = (opp: Opportunity) => {
    setSelected(prev => {
      const newSet = new Set(prev);
      if (newSet.has(opp)) {
        newSet.delete(opp);
      } else {
        newSet.add(opp);
      }
      console.log(newSet, "NEW SET");
      return newSet;
    });
  };

  const handleConfirm = () => {
    onSelect(Array.from(selected));
    setSelected(new Set());
    setSearchTerm('');
    onClose();
  };

  const handleCancel = () => {
    setSelected(new Set());
    setSearchTerm('');
    onClose();
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-700';
    if (score >= 60) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Select Opportunities to Merge</DialogTitle>
          <DialogDescription>
            Select one or more opportunities to merge with "{currentOpportunity?.title}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search opportunities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Selected count */}
          {selected.size > 0 && (
            <div className="bg-primary/10 p-3 rounded-lg">
              <span className="text-sm font-medium">
                {selected.size} {selected.size === 1 ? 'opportunity' : 'opportunities'} selected
              </span>
            </div>
          )}

          {/* Opportunities list */}
          {!loading.opportunityLoading && availableOpportunities.length &&
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-2">
                {availableOpportunities.map((opp) => (
                  <div
                    key={opp.id}
                    className={`p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${selected.has(opp) ? 'border-primary bg-primary/5' : ''
                      }`}
                    onClick={() => toggleSelection(opp)}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selected.has(opp)}
                        onCheckedChange={() => toggleSelection(opp)}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-medium text-sm flex-1">{opp.title}</h4>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <div className="flex items-center gap-1 text-green-600 font-semibold text-sm">
                              <DollarSign className="h-3 w-3" />
                              <span>{opp.money.toLocaleString()}</span>
                            </div>
                            <Badge
                              variant="secondary"
                              className={`text-xs ${getConfidenceColor(opp.confidence_score)}`}
                            >
                              {opp.confidence_score}%
                            </Badge>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{opp.summary}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="capitalize">{opp.stage.replace('-', ' ')}</span>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {opp.expected_close_date}
                          </div>
                          {/* {opp.assignedTo && (
                          <>
                            <span>•</span>
                            <span>{opp.assignedTo}</span>
                          </>
                        )} */}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
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
            </ScrollArea>
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

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={selected.size === 0}>
            Continue ({selected.size})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
