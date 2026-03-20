import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  MessageSquare,
  Phone,
  Mail,
  FileText,
  Clock,
  Filter,
  Target,
  DollarSign,
  Users,
  Activity,
  CheckCircle,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
// import { Contact, Opportunity } from '@/pages/Contacts';
import { Contact } from "../../types/Contact";
import { Opportunity } from "../../types/Opportunity";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useOpportunityStore } from '../../store/opportunityStore';

interface UpdateTimelineProps {
  contact?: Contact;
  opportunity?: Opportunity;
}

interface TimelineEntry {
  id: string;
  type: 'confidence-change' | 'stage-change' | 'value-change' | 'activity' | 'meeting' | 'email' | 'call' | 'note' | 'contact-added' | 'feedback' | 'assignment';
  title: string;
  description: string;
  timestamp: string;
  actor: string;
  metadata?: {
    oldValue?: string | number;
    newValue?: string | number;
    changeAmount?: number;
    reason?: string;
    relatedActivity?: string;
  };
  impact: 'positive' | 'negative' | 'neutral';
}

const mapOpportunitiesToTimeline = (opportunities: any[]): TimelineEntry[] => {
  const timeline: TimelineEntry[] = [];

  opportunities.forEach((opp, index) => {
    // Stage update
    timeline.push({
      id: `${opp.opportunity_log_id}-stage-${index}`,
      type: "stage-change",
      title: `Stage updated to ${opp.stage}`,
      description: opp.summary,
      timestamp: "Recently updated",
      actor: "System",
      impact: opp.stage === "Closed-won" ? "positive" : "neutral",
    });

    // Confidence score
    timeline.push({
      id: `${opp.opportunity_log_id}-confidence-${index}`,
      type: "confidence-change",
      title: "Confidence Score Updated",
      description: opp.confidence_description,
      timestamp: "Recently updated",
      actor: "AI Analysis",
      metadata: {
        newValue: Math.round(opp.confidence_score * 100),
      },
      impact: opp.confidence_score > 0.7 ? "positive" : "neutral",
    });

    // Deal value change
    if (opp.money) {
      timeline.push({
        id: `${opp.opportunity_log_id}-value-${index}`,
        type: "value-change",
        title: "Deal Value Updated",
        description: `Deal value set to $${opp.money}`,
        timestamp: "Recently updated",
        actor: "System",
        metadata: {
          newValue: opp.money,
        },
        impact: "positive",
      });
    }

    // Sources
    opp.source?.forEach((src: any, index: number) => {
      timeline.push({
        id: `${opp.opportunity_log_id}-source-${index}`,
        type: src.source.toLowerCase(),
        title: `Interaction via ${src.source}`,
        description: `Opportunity updated through ${src.source}`,
        timestamp: "Recently updated",
        actor: "Sales Team",
        impact: "neutral",
      });
    });
  });

  return timeline.reverse();
};


const mockTimelineEntries: TimelineEntry[] = [
  {
    id: '1',
    type: 'confidence-change',
    title: 'Confidence Score Increased',
    description: 'Confidence score improved due to positive client response in demo meeting',
    timestamp: '2 hours ago',
    actor: 'AI Analysis',
    metadata: {
      oldValue: 72,
      newValue: 85,
      changeAmount: 13,
      reason: 'Positive client engagement in demo',
      relatedActivity: 'Demo Meeting - Q1 Project'
    },
    impact: 'positive'
  },
  {
    id: '2',
    type: 'stage-change',
    title: 'Stage Updated',
    description: 'Opportunity moved from Discovery to Qualification stage',
    timestamp: '1 day ago',
    actor: 'Sarah Wilson',
    metadata: {
      oldValue: 'Discovery',
      newValue: 'Qualification'
    },
    impact: 'positive'
  },
  {
    id: '3',
    type: 'activity',
    title: 'Demo Presentation Completed',
    description: 'Conducted product demo with key stakeholders. Client showed high interest in enterprise features.',
    timestamp: '1 day ago',
    actor: 'John Smith',
    impact: 'positive'
  },
  {
    id: '4',
    type: 'value-change',
    title: 'Deal Value Updated',
    description: 'Opportunity value increased based on expanded scope requirements',
    timestamp: '2 days ago',
    actor: 'Mike Johnson',
    metadata: {
      oldValue: 50000,
      newValue: 75000,
      changeAmount: 25000
    },
    impact: 'positive'
  },
  {
    id: '5',
    type: 'confidence-change',
    title: 'Confidence Score Decreased',
    description: 'Score reduced due to delayed response from client',
    timestamp: '3 days ago',
    actor: 'AI Analysis',
    metadata: {
      oldValue: 78,
      newValue: 72,
      changeAmount: -6,
      reason: 'Client delayed response to proposal',
      relatedActivity: 'Follow-up Email'
    },
    impact: 'negative'
  },
  {
    id: '6',
    type: 'contact-added',
    title: 'New Contact Added',
    description: 'Decision maker Jane Smith added to opportunity',
    timestamp: '5 days ago',
    actor: 'Sarah Wilson',
    metadata: {
      newValue: 'Jane Smith - CTO'
    },
    impact: 'positive'
  },
  {
    id: '7',
    type: 'feedback',
    title: 'Opportunity Confirmed',
    description: 'Sales team confirmed this opportunity as valid and high-priority',
    timestamp: '1 week ago',
    actor: 'Sales Team',
    metadata: {
      newValue: 'confirmed'
    },
    impact: 'positive'
  }
];

const getTimelineIcon = (type: string, impact: string) => {
  const iconMap = {
    'confidence-change': impact === 'positive' ? TrendingUp : TrendingDown,
    'stage-change': ArrowRight,
    'value-change': DollarSign,
    'activity': Activity,
    'meeting': Calendar,
    'email': Mail,
    'call': Phone,
    'note': FileText,
    'contact-added': Users,
    'feedback': impact === 'positive' ? CheckCircle : AlertCircle,
    'assignment': Target
  };
  return iconMap[type] || Activity;
};

const getTimelineColor = (type: string, impact: string) => {
  if (impact === 'positive') return 'bg-green-100 text-green-600 border-green-200';
  if (impact === 'negative') return 'bg-red-100 text-red-600 border-red-200';

  const colorMap = {
    'confidence-change': 'bg-blue-100 text-blue-600 border-blue-200',
    'stage-change': 'bg-purple-100 text-purple-600 border-purple-200',
    'value-change': 'bg-emerald-100 text-emerald-600 border-emerald-200',
    'activity': 'bg-orange-100 text-orange-600 border-orange-200',
    'meeting': 'bg-blue-100 text-blue-600 border-blue-200',
    'email': 'bg-blue-100 text-blue-600 border-blue-200',
    'call': 'bg-yellow-100 text-yellow-600 border-yellow-200',
    'note': 'bg-gray-100 text-gray-600 border-gray-200',
    'contact-added': 'bg-indigo-100 text-indigo-600 border-indigo-200',
    'feedback': 'bg-cyan-100 text-cyan-600 border-cyan-200',
    'assignment': 'bg-pink-100 text-pink-600 border-pink-200'
  };
  return colorMap[type] || 'bg-gray-100 text-gray-600 border-gray-200';
};

const getImpactBadge = (impact: string) => {
  const variants = {
    positive: 'bg-green-100 text-green-700 border-green-200',
    negative: 'bg-red-100 text-red-700 border-red-200',
    neutral: 'bg-gray-100 text-gray-700 border-gray-200'
  };
  return variants[impact] || variants.neutral;
};

export const UpdateTimeline = ({ contact, opportunity }: UpdateTimelineProps) => {
  const [typeFilter, setTypeFilter] = useState('all');
  const [entries, setEntries] = useState([]);
  const { opportunities, loadOpportunity, loading } = useOpportunityStore();

  useEffect(() => {
    loadOpportunity([{ key_name: "associated_contacts.email", operator: "==", key_value: contact?.email || opportunity?.contact_mailid }]);
  }, [loadOpportunity, contact?.email]);

  useEffect(() => {
    if (opportunities.length > 0) {
      const flattened = opportunities.map(opp => opp.existing_opportunity).flat();

      const timelineData = mapOpportunitiesToTimeline(flattened);

      setEntries(timelineData.reverse())
    }
  }, [opportunities]);

  console.log(entries);

  const types = ['all', 'confidence-change', 'stage-change', 'value-change', 'activity', 'meeting', 'email', 'call', 'contact-added', 'feedback'];

  const filteredEntries = entries.filter(entry =>
    typeFilter === 'all' || entry.type === typeFilter
  );

  const formatMetadataValue = (value: string | number) => {
    if (typeof value === 'number' && value > 1000) {
      return `$${(value / 1000).toFixed(0)}k`;
    }
    return value;
  };

  return (
    <div className="flex-1 h-full overflow-y-auto">
      <div className="p-2">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Update Timeline</h3>
            <p className="text-sm text-muted-foreground">Track all changes and activities</p>
          </div>
          <div className="flex items-center space-x-2">
            <Filter size={16} className="text-muted-foreground" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-sm border border-border rounded px-2 py-1 bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {types.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Updates' : type.split('-').map(word =>
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {(loading.opportunityLoading && !filteredEntries.length) && <div className="flex justify-center items-center h-full">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
            Loading...
          </div>}
          {(!loading.opportunityLoading && filteredEntries.length > 0) && filteredEntries.map((entry, index) => {
            const IconComponent = getTimelineIcon(entry.type, entry.impact);

            return (
              <div key={entry.id} className="relative">
                {index !== filteredEntries.length - 1 && (
                  <div className="absolute left-6 top-14 w-0.5 h-full bg-border"></div>
                )}

                <div className="flex space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${getTimelineColor(entry.type, entry.impact)}`}>
                    <IconComponent size={20} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="bg-card border border-border rounded-lg p-4 hover:shadow-sm transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-card-foreground">{entry.title}</h4>
                            <Badge className={`text-xs px-2 py-0.5 ${getImpactBadge(entry.impact)}`}>
                              {entry.impact}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{entry.description}</p>


                          {entry.metadata && (
                            <div className="space-y-1 mb-3">
                              {entry.metadata.oldValue !== undefined && entry.metadata.newValue !== undefined && (
                                <div className="flex items-center text-xs text-muted-foreground">
                                  <span className="font-medium">Changed from:</span>
                                  <span className="mx-1">{formatMetadataValue(entry.metadata.oldValue)}</span>
                                  <ArrowRight size={12} className="mx-1" />
                                  <span className="font-medium text-foreground">{formatMetadataValue(entry.metadata.newValue)}</span>
                                  {entry.metadata.changeAmount && (
                                    <Badge className={`ml-2 text-xs px-1.5 py-0.5 ${entry.metadata.changeAmount > 0
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-red-100 text-red-700'
                                      }`}>
                                      {entry.metadata.changeAmount > 0 ? '+' : ''}{entry.metadata.changeAmount}
                                      {entry.type === 'confidence-change' ? ' pts' : ''}
                                    </Badge>
                                  )}
                                </div>
                              )}
                              {entry.metadata.reason && (
                                <div className="text-xs text-muted-foreground">
                                  <span className="font-medium">Reason:</span> {entry.metadata.reason}
                                </div>
                              )}
                              {entry.metadata.relatedActivity && (
                                <div className="text-xs text-muted-foreground">
                                  <span className="font-medium">Related to:</span> {entry.metadata.relatedActivity}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center">
                          <Clock size={12} className="mr-1" />
                          {entry.timestamp}
                        </div>
                        <span>by {entry.actor}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {!loading.opportunityLoading && filteredEntries.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <Activity size={48} className="mx-auto mb-4 opacity-50" />
              <p>No updates found for the selected filter</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};