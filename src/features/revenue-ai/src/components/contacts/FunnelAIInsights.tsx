import React from 'react';
import { Brain, TrendingUp, Target, Users, Lightbulb, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Opportunity {
  id: string;
  title: string;
  stage: string;
  value: number;
  currency: string;
  confidenceScore: number;
  expectedCloseDate: string;
  assignedTo?: string;
}

interface FunnelAIInsightsProps {
  opportunities: Opportunity[];
  selectedStage?: string;
}

export const FunnelAIInsights: React.FC<FunnelAIInsightsProps> = ({ 
  opportunities, 
  selectedStage 
}) => {
  // Generate AI insights based on opportunities data
  const generateInsights = () => {
    const stageData = opportunities.reduce((acc, opp) => {
      if (!acc[opp.stage]) {
        acc[opp.stage] = { count: 0, totalValue: 0, companies: [] };
      }
      acc[opp.stage].count++;
      acc[opp.stage].totalValue += opp.value;
      acc[opp.stage].companies.push(opp.title);
      return acc;
    }, {} as Record<string, { count: number; totalValue: number; companies: string[] }>);

    // Most valuable stage
    const mostValuableStage = Object.entries(stageData)
      .sort(([,a], [,b]) => b.totalValue - a.totalValue)[0];

    // Highest conversion potential
    const highConfidenceDeals = opportunities.filter(opp => opp.confidenceScore >= 80);
    
    // Feature analysis (simulated based on deal titles)
    const features = opportunities.map(opp => {
      const title = opp.title.toLowerCase();
      if (title.includes('cloud') || title.includes('saas')) return 'Cloud Solutions';
      if (title.includes('ai') || title.includes('ml')) return 'AI/ML Features';
      if (title.includes('security')) return 'Security';
      if (title.includes('integration')) return 'API Integration';
      if (title.includes('analytics')) return 'Analytics';
      return 'Enterprise Features';
    });

    const featureCounts = features.reduce((acc, feature) => {
      acc[feature] = (acc[feature] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topFeature = Object.entries(featureCounts)
      .sort(([,a], [,b]) => b - a)[0];

    return {
      mostValuableStage,
      highConfidenceDeals,
      topFeature,
      stageData,
      totalPipelineValue: opportunities.reduce((sum, opp) => sum + opp.value, 0),
      avgDealSize: opportunities.length ? opportunities.reduce((sum, opp) => sum + opp.value, 0) / opportunities.length : 0
    };
  };

  const insights = generateInsights();

  const getStageSpecificInsights = (stage: string) => {
    const stageOpps = opportunities.filter(opp => opp.stage === stage);
    const avgConfidence = stageOpps.length ? 
      stageOpps.reduce((sum, opp) => sum + opp.confidenceScore, 0) / stageOpps.length : 0;
    
    const companies = stageOpps.map(opp => opp.title).slice(0, 3);
    
    return { avgConfidence, companies, count: stageOpps.length };
  };

  return (
    <div className="space-y-4">
      {/* AI Insights Header */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">AI Pipeline Intelligence</CardTitle>
            <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
              Live Insights
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Hottest Stage</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {insights.mostValuableStage?.[0] || 'N/A'} 
                <span className="block font-semibold text-primary">
                  ${insights.mostValuableStage?.[1]?.totalValue?.toLocaleString() || '0'}
                </span>
              </p>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium">Top Feature</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {insights.topFeature?.[0] || 'N/A'}
                <span className="block font-semibold text-primary">
                  {insights.topFeature?.[1] || 0} deals
                </span>
              </p>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <Target className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">High Confidence</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {insights.highConfidenceDeals.length} deals
                <span className="block font-semibold text-primary">
                  80%+ confidence
                </span>
              </p>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Avg Deal Size</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Pipeline Health
                <span className="block font-semibold text-primary">
                  ${insights.avgDealSize.toLocaleString()}
                </span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stage-Specific Insights */}
      {selectedStage && (
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">
                {selectedStage.charAt(0).toUpperCase() + selectedStage.slice(1)} Stage Intelligence
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {(() => {
              const stageInsights = getStageSpecificInsights(selectedStage);
              return (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Average Confidence</span>
                    <Badge 
                      variant="outline" 
                      className={`${stageInsights.avgConfidence >= 70 ? 'border-green-500 text-green-700' : 'border-yellow-500 text-yellow-700'}`}
                    >
                      {stageInsights.avgConfidence.toFixed(0)}%
                    </Badge>
                  </div>
                  
                  {stageInsights.companies.length > 0 && (
                    <div>
                      <span className="text-sm text-muted-foreground">Key Companies:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {stageInsights.companies.map((company, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {company.length > 20 ? company.substring(0, 20) + '...' : company}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="text-xs text-muted-foreground p-2 bg-muted/30 rounded">
                    💡 <strong>AI Recommendation:</strong> 
                    {stageInsights.avgConfidence >= 80 ? 
                      " Focus on accelerating these high-confidence deals through the pipeline." :
                      stageInsights.avgConfidence >= 60 ?
                      " Consider additional qualification to increase success probability." :
                      " Review deal fit and consider re-qualification or nurturing approach."
                    }
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Smart Actions</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200 dark:border-blue-800">
              <div className="font-medium text-blue-900 dark:text-blue-100">Focus Priority</div>
              <div className="text-blue-700 dark:text-blue-300 mt-1">
                {insights.highConfidenceDeals.length} deals need immediate attention
              </div>
            </div>
            <div className="p-2 bg-green-50 dark:bg-green-950/20 rounded border border-green-200 dark:border-green-800">
              <div className="font-medium text-green-900 dark:text-green-100">Growth Opportunity</div>
              <div className="text-green-700 dark:text-green-300 mt-1">
                {insights.topFeature?.[0]} requests are trending
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};