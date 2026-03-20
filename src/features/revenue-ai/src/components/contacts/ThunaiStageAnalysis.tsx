import React, { useEffect } from 'react';
import { Brain, Target, TrendingUp, CheckCircle, AlertCircle, Lightbulb } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { OpportunityFunnel } from '../../types/OpportunityFunnelView';
import { useOpportunityStore } from '../../store/opportunityStore';

interface ThunaiStageAnalysisProps {
  isOpen: boolean;
  onClose: () => void;
  stage: string;
}

export const ThunaiStageAnalysis: React.FC<ThunaiStageAnalysisProps> = ({
  isOpen,
  onClose,
  stage,
}) => {

  const { getStageAnalysis, stageAnalysis, loading } = useOpportunityStore();

  useEffect(() => {
    if (!isOpen || !stage) return;
    getStageAnalysis(stage);
  }, [stage, isOpen]);

  const safeStageSummary = stageAnalysis?.stage_summary ?? {
    total_deals: 0,
    total_deal_value: 0,
    average_confidence_score: 0
  };

  const safeTopDeals = stageAnalysis?.top_deals ?? [];

  // console.log(opportunities);
  const stageDisplayName = stage?.split('-').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');

  // Filter high engagement deals (confidence > 50%)
  const highEngagementDeals = safeTopDeals.filter(opp =>
    opp.stage === stage && opp.confidence_score > 50
  );

  console.log(highEngagementDeals);

  // Generate AI insights based on stage and deals
  const generateStageInsights = () => {
    if (!highEngagementDeals.length) {
      return {
        totalValue: 0,
        avgConfidence: 0,
        featureAnalysis: [],
        topFeatures: [],
        recommendations: []
      }
    }
    const totalValue = highEngagementDeals?.reduce((sum, deal) => sum + deal.money, 0);
    const avgConfidence = highEngagementDeals.length > 0
      ? highEngagementDeals?.reduce((sum, deal) => sum + deal.confidence_score, 0) / highEngagementDeals?.length
      : 0;

    // Analyze features based on deal titles (simulated AI analysis)
    const featureAnalysis = highEngagementDeals?.map(deal => {
      const title = deal.detailed_analysis.opportunity_details.title.toLowerCase();
      console.log(title);
      const features = [];

      if (title.includes('cloud') || title.includes('saas')) features.push('Cloud Migration');
      if (title.includes('ai') || title.includes('ml') || title.includes('automation')) features.push('AI/ML Capabilities');
      if (title.includes('security') || title.includes('compliance')) features.push('Security & Compliance');
      if (title.includes('integration') || title.includes('api')) features.push('System Integration');
      if (title.includes('analytics') || title.includes('reporting')) features.push('Advanced Analytics');
      if (title.includes('mobile') || title.includes('app')) features.push('Mobile Solutions');
      if (title.includes('custom') || title.includes('enterprise')) features.push('Custom Enterprise Features');

      return { deal: deal.detailed_analysis.opportunity_details.title, features: features.length > 0 ? features : ['Core Platform Features'] };
    });

    // Count feature requests
    const featureCounts = featureAnalysis?.reduce((acc, analysis) => {
      analysis?.features.forEach(feature => {
        acc[feature] = (acc[feature] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    const topFeatures = Object.entries(featureCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    // Stage-specific recommendations
    const getStageRecommendations = () => {
      switch (stage) {
        case 'discovery':
          return [
            'Prepare comprehensive product demo focusing on identified pain points',
            'Gather detailed technical requirements and integration needs',
            'Schedule stakeholder meetings to understand decision-making process'
          ];
        case 'qualification':
          return [
            'Validate budget authority and decision timeline',
            'Present ROI calculations and business case templates',
            'Identify potential objections and prepare responses'
          ];
        case 'needs-analysis':
          return [
            'Conduct technical deep-dive sessions with IT teams',
            'Prepare customized solution architecture documents',
            'Address specific compliance and security requirements'
          ];
        case 'proposal':
          return [
            'Finalize pricing strategy and discount approvals',
            'Prepare detailed implementation timeline and milestones',
            'Create compelling proposal presentation with clear value props'
          ];
        case 'negotiation':
          return [
            'Prepare contract terms and pricing flexibility matrix',
            'Identify win-win scenarios for contract negotiations',
            'Coordinate with legal team for contract reviews'
          ];
        default:
          return [
            'Maintain regular communication with key stakeholders',
            'Prepare relevant case studies and success stories',
            'Focus on building strong relationships with decision makers'
          ];
      }
    };

    return {
      totalValue,
      avgConfidence,
      featureAnalysis,
      topFeatures,
      recommendations: getStageRecommendations()
    };
  };

  const insights = generateStageInsights();

  if (loading.getStageAnalysisLoading) {
    return
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" aria-describedby=''>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Thunai AI Analysis: {stageDisplayName} Stage
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* High Engagement Overview */}
          {loading.getStageAnalysisLoading ? (<div className="flex justify-center items-center h-full">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
            Loading...
          </div>) : (

            <>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="h-4 w-4 text-blue-600" />
                    High Engagement Deals Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{safeStageSummary.total_deals}</div>
                      <div className="text-sm text-muted-foreground">Active Deals</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{safeStageSummary.total_deal_value.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Total Value</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{safeStageSummary.average_confidence_score.toFixed(2)}%</div>
                      <div className="text-sm text-muted-foreground">Avg Confidence</div>
                    </div>
                  </div>

                  {safeTopDeals.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Key Deals:</h4>
                      <div className="space-y-2">
                        {safeTopDeals.map((deal) => (
                          <div key={deal.reference_id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                            <div>
                              <div className="font-medium text-sm">{deal.detailed_analysis.opportunity_details.title}</div>
                              <div className="text-xs text-muted-foreground">
                                ${deal.money.toLocaleString()} • {deal.detailed_analysis.opportunity_details.owner}
                              </div>
                            </div>
                            <Badge
                              variant="outline"
                              className={`${deal.confidence_score >= 70 ? 'border-green-500 text-green-700' : 'border-blue-500 text-blue-700'}`}
                            >
                              {deal.confidence_score}%
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-purple-600" />
                    Key Feature Requests & Asks
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {insights.topFeatures.length > 0 ? (
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium mb-2">Most Requested Features:</h4>
                        <div className="flex flex-wrap gap-2">
                          {insights.topFeatures.map(([feature, count]) => (
                            <Badge key={feature} variant="secondary" className="text-sm">
                              {feature} ({count})
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="font-medium mb-2">Deal-Specific Analysis:</h4>
                        <div className="space-y-2">
                          {insights.featureAnalysis.slice(0, 3).map((analysis, index) => (
                            <div key={index} className="p-2 bg-muted/30 rounded">
                              <div className="font-medium text-sm mb-1">{analysis.deal}</div>
                              <div className="flex flex-wrap gap-1">
                                {analysis.features.map((feature, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {feature}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-4">
                      No high engagement deals found in this stage
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-600" />
                    What You Need to Prepare
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {insights.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{recommendation}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-primary/5 border-primary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-primary" />
                    AI Strategic Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Focus Area:</strong> Based on the analysis, {insights.topFeatures[0]?.[0] || 'core platform features'}
                      {insights.topFeatures[0] && ` (${insights.topFeatures[0][1]} deals)`} should be your primary focus for this stage.
                    </p>
                    <p>
                      <strong>Success Probability:</strong> With an average confidence of {insights.avgConfidence.toFixed(0)}%,
                      these deals show {insights.avgConfidence >= 70 ? 'strong' : insights.avgConfidence >= 50 ? 'moderate' : 'developing'} momentum.
                    </p>
                    <p>
                      <strong>Next Steps:</strong> Prioritize the highest-value deals and ensure your team is prepared with relevant
                      demos, case studies, and technical documentation for the identified feature requests.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};