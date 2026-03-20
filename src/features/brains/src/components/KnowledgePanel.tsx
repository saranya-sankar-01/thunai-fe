import { useState } from 'react';
import { 
  Sparkles, BookOpen, Lightbulb, CheckSquare, StickyNote, 
  ThumbsUp, ThumbsDown, Plus, Edit, Tag, MessageSquare,
  ChevronDown, ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";

interface Insight {
  id: string;
  type: 'summary' | 'insight' | 'action' | 'note';
  title: string;
  content: string;
  section?: string;
  feedback?: 'up' | 'down';
  userNotes?: string;
}

interface KnowledgePanelProps {
  insights: Insight[];
  tags: string[];
  summary: string;
}

const getInsightIcon = (type: string) => {
  switch (type) {
    case 'summary':
      return <BookOpen className="w-4 h-4" />;
    case 'insight':
      return <Lightbulb className="w-4 h-4" />;
    case 'action':
      return <CheckSquare className="w-4 h-4" />;
    case 'note':
      return <StickyNote className="w-4 h-4" />;
    default:
      return <Sparkles className="w-4 h-4" />;
  }
};

const getInsightGradient = (type: string) => {
  switch (type) {
    case 'summary':
      return 'bg-gradient-summary';
    case 'insight':
      return 'bg-gradient-insights';
    case 'action':
      return 'bg-gradient-categories';
    case 'note':
      return 'bg-gradient-notes';
    default:
      return 'bg-gradient-summary';
  }
};

const InsightCard = ({ insight, onFeedback, onAddNote }: {
  insight: Insight;
  onFeedback: (id: string, feedback: 'up' | 'down') => void;
  onAddNote: (id: string, note: string) => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteText, setNoteText] = useState(insight.userNotes || '');

  const handleSaveNote = () => {
    onAddNote(insight.id, noteText);
    setShowNoteInput(false);
    toast("Note saved successfully!", { icon: "📝" });
  };

  return (
    <Card className="knowledge-card">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-accent/50 smooth-transition">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${getInsightGradient(insight.type)}`}>
                  {getInsightIcon(insight.type)}
                </div>
                <div>
                  <CardTitle className="text-sm font-medium">
                    {insight.title}
                  </CardTitle>
                  {insight.section && (
                    <CardDescription className="text-xs">
                      From: {insight.section}
                    </CardDescription>
                  )}
                </div>
              </div>
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              {insight.content}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onFeedback(insight.id, 'up')}
                  className={`${insight.feedback === 'up' ? 'bg-success/10 text-success' : ''}`}
                >
                  <ThumbsUp className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onFeedback(insight.id, 'down')}
                  className={`${insight.feedback === 'down' ? 'bg-destructive/10 text-destructive' : ''}`}
                >
                  <ThumbsDown className="w-4 h-4" />
                </Button>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNoteInput(!showNoteInput)}
              >
                <Edit className="w-4 h-4 mr-1" />
                Note
              </Button>
            </div>
            
            {showNoteInput && (
              <div className="mt-4 space-y-2">
                <Textarea
                  placeholder="Add your thoughts or corrections..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="thunai-input text-sm"
                  rows={3}
                />
                <div className="flex space-x-2">
                  <Button size="sm" onClick={handleSaveNote} className="thunai-button">
                    Save Note
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowNoteInput(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
            
            {insight.userNotes && !showNoteInput && (
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-xs font-medium text-muted-foreground mb-1">Your Note:</p>
                <p className="text-sm">{insight.userNotes}</p>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export const KnowledgePanel = ({ insights, tags, summary }: KnowledgePanelProps) => {
  const [customTags, setCustomTags] = useState<string[]>(tags);
  const [newTag, setNewTag] = useState('');
  const [insightData, setInsightData] = useState(insights);

  const handleFeedback = (id: string, feedback: 'up' | 'down') => {
    setInsightData(prev => prev.map(insight => 
      insight.id === id 
        ? { ...insight, feedback: insight.feedback === feedback ? undefined : feedback }
        : insight
    ));
    
    toast(feedback === 'up' ? "Thanks for the positive feedback!" : "Feedback noted. Thunai will improve.", {
      icon: feedback === 'up' ? "👍" : "👎"
    });
  };

  const handleAddNote = (id: string, note: string) => {
    setInsightData(prev => prev.map(insight => 
      insight.id === id ? { ...insight, userNotes: note } : insight
    ));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !customTags.includes(newTag.trim())) {
      setCustomTags(prev => [...prev, newTag.trim()]);
      setNewTag('');
      toast("Tag added successfully!", { icon: "🏷️" });
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setCustomTags(prev => prev.filter(tag => tag !== tagToRemove));
    toast("Tag removed", { icon: "🗑️" });
  };

  return (
    <div className="space-y-6">
      {/* Thunai Header */}
      <Card className="knowledge-card animate-scale-in">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span>Thunai Knowledge Cards</span>
          </CardTitle>
          <CardDescription>
            AI-powered insights, summaries, and actionable intelligence from your content.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Quick Summary */}
      <Card className="knowledge-card bg-gradient-summary">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4" />
            <span>Quick Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">{summary}</p>
        </CardContent>
      </Card>

      {/* Categories/Tags */}
      <Card className="knowledge-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Tag className="w-4 h-4" />
            <span>Categories & Tags</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {customTags.map((tag) => (
              <Badge 
                key={tag} 
                variant="secondary" 
                className="cursor-pointer hover:bg-destructive/10 hover:text-destructive smooth-transition"
                onClick={() => handleRemoveTag(tag)}
              >
                {tag} ×
              </Badge>
            ))}
          </div>
          
          <div className="flex space-x-2">
            <Input
              placeholder="Add custom tag..."
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              className="thunai-input flex-1"
            />
            <Button onClick={handleAddTag} size="sm" className="thunai-button">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center space-x-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            <span>AI Insights & Actions</span>
          </h3>
          <Badge variant="secondary">{insightData.length} insights</Badge>
        </div>
        
        {insightData.map((insight) => (
          <InsightCard
            key={insight.id}
            insight={insight}
            onFeedback={handleFeedback}
            onAddNote={handleAddNote}
          />
        ))}
      </div>

      {/* Teach Thunai More */}
      <Card className="knowledge-card bg-gradient-glow border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-primary">
            <MessageSquare className="w-4 h-4" />
            <span>Teach Thunai More</span>
          </CardTitle>
          <CardDescription>
            Help improve these insights by adding corrections, context, or additional information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="thunai-button w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Custom Insight
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};