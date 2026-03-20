import { BarChart3, FileText, Link2, Video, Globe, TrendingUp, Eye, MessageSquare, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Mock stats data - in real app this would come from an API
const mockStats = {
  documents: { count: 27, change: +4 },
  links: { count: 14, change: +2 },
  videos: { count: 8, change: +1 },
  streams: { count: 3, change: +1 },
  totalViews: { count: 1247, change: +89 },
  totalInsights: { count: 156, change: +23 },
  activeUsers: { count: 12, change: +3 },
  totalKnowledge: { count: 52, change: +7 }
};

export const StatsOverview = () => {
  return (
    <div className="space-y-6 mb-8">
      {/* Knowledge Totals Summary */}
      <Card className="knowledge-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Knowledge Overview</CardTitle>
              <CardDescription>Your complete knowledge workspace</CardDescription>
            </div>
            <div className="bg-gradient-primary rounded-full p-3">
              <BarChart3 className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-2xl font-bold">{mockStats.documents.count}</span>
              </div>
              <p className="text-xs text-muted-foreground">Documents & PDFs</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <Link2 className="w-4 h-4 text-accent" />
                <span className="text-2xl font-bold">{mockStats.links.count}</span>
              </div>
              <p className="text-xs text-muted-foreground">Web Links</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <Video className="w-4 h-4 text-secondary" />
                <span className="text-2xl font-bold">{mockStats.videos.count}</span>
              </div>
              <p className="text-xs text-muted-foreground">Videos</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <Globe className="w-4 h-4 text-destructive" />
                <span className="text-2xl font-bold">{mockStats.streams.count}</span>
              </div>
              <p className="text-xs text-muted-foreground">Streams</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="knowledge-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalViews.count.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-primary">+{mockStats.totalViews.change}</span> from last week
            </p>
          </CardContent>
        </Card>
        
        <Card className="knowledge-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Insights</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalInsights.count}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-primary">+{mockStats.totalInsights.change}</span> from last week
            </p>
          </CardContent>
        </Card>
        
        <Card className="knowledge-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.activeUsers.count}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-primary">+{mockStats.activeUsers.change}</span> from last week
            </p>
          </CardContent>
        </Card>
        
        <Card className="knowledge-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Knowledge Items</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalKnowledge.count}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-primary">+{mockStats.totalKnowledge.change}</span> from last week
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};