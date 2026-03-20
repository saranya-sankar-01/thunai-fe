import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Calendar, Loader2 } from 'lucide-react';
import { Opportunity } from '../../types/Opportunity';
import { useOpportunityStore } from '../../store/opportunityStore';

interface OpportunityMergeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedOpportunities: Opportunity[];
}

export const OpportunityMergeDialog: React.FC<OpportunityMergeDialogProps> = ({
  isOpen,
  onClose,
  selectedOpportunities,
}) => {
  const { mergeOpportunities, loading } = useOpportunityStore();
  const [instructions, setInstructions] = useState('');

  const handleSubmit = async () => {
    if (!instructions.trim()) {
      return;
    }

    const payload = {
      id: selectedOpportunities.map((opp) => opp.id),
      ai_instruction: instructions
    }

    const success = await mergeOpportunities(payload);

    if (success) {
      setInstructions("");
      onClose();
    }
  };

  const totalValue = selectedOpportunities.reduce((sum, opp) => sum + +opp.money, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Merge Opportunities</DialogTitle>
          <DialogDescription>
            Provide instructions for AI to merge these opportunities into one.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Selected Opportunities List */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Selected Opportunities ({selectedOpportunities.length})</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {selectedOpportunities.map((opp) => (
                <div key={opp.id} className="p-3 border rounded-lg bg-muted/50">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{opp.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{opp.summary}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <div className="flex items-center gap-1 text-green-600 font-semibold text-sm">
                        <DollarSign className="h-3 w-3" />
                        <span>{opp.money.toLocaleString()}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {opp.confidence_score}%
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="capitalize">{opp.stage.replace('-', ' ')}</span>
                    <span>•</span>
                    {opp.expected_close_date &&
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(opp.expected_close_date).toLocaleDateString()}
                      </div>
                    }
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
              <span className="text-sm font-medium">Combined Value:</span>
              <span className="text-lg font-semibold text-primary">
                ${totalValue.toLocaleString()} {selectedOpportunities[0]?.currency}
              </span>
            </div>
          </div>

          {/* AI Instructions */}
          <div className="space-y-2">
            <label htmlFor="merge-instructions" className="text-sm font-medium">
              Merge Instructions for AI
            </label>
            <Textarea
              id="merge-instructions"
              placeholder="Provide instructions on how to merge these opportunities. For example: 'Combine these into one opportunity, keep the highest value, use the earliest close date, and merge all associated contacts.'"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="min-h-[120px]"
            />
            <p className="text-xs text-muted-foreground">
              The AI will use these instructions to intelligently merge the selected opportunities.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading.mergingOpportunities}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!instructions.trim() || loading.mergingOpportunities}
          >
            {loading.mergingOpportunities ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Merging...
              </>
            ) : (
              'Merge Opportunities'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
