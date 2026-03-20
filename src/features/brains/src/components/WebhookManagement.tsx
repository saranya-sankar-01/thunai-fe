import { useState } from 'react';
import { Webhook, Copy, Edit, Trash2, Play, Pause, MoreVertical, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  status: 'active' | 'paused' | 'error';
  lastTriggered: string;
  totalCalls: number;
  successRate: number;
  description?: string;
}

interface WebhookEvent {
  id: string;
  webhookId: string;
  timestamp: string;
  status: 'success' | 'failed' | 'pending';
  responseTime: number;
  payload: any;
  response?: any;
  error?: string;
}

const mockWebhooks: WebhookConfig[] = [
  {
    id: '1',
    name: 'Document Processing',
    url: 'https://api.thunai.com/webhooks/doc-process-123',
    status: 'active',
    lastTriggered: '2024-01-15T10:30:00Z',
    totalCalls: 1247,
    successRate: 98.2,
    description: 'Processes incoming documents and extracts metadata'
  },
  {
    id: '2',
    name: 'Real-time Analytics',
    url: 'https://api.thunai.com/webhooks/analytics-456',
    status: 'active',
    lastTriggered: '2024-01-15T10:25:00Z',
    totalCalls: 3421,
    successRate: 99.7,
    description: 'Captures user interaction events for analytics'
  },
  {
    id: '3',
    name: 'Content Sync',
    url: 'https://api.thunai.com/webhooks/content-sync-789',
    status: 'error',
    lastTriggered: '2024-01-15T09:15:00Z',
    totalCalls: 892,
    successRate: 89.1,
    description: 'Syncs content updates from external sources'
  }
];

const mockWebhookEvents: WebhookEvent[] = [
  {
    id: '1',
    webhookId: '1',
    timestamp: '2024-01-15T10:30:00Z',
    status: 'success',
    responseTime: 145,
    payload: { type: 'document', id: 'doc_123', action: 'create' }
  },
  {
    id: '2',
    webhookId: '2',
    timestamp: '2024-01-15T10:25:00Z',
    status: 'success',
    responseTime: 89,
    payload: { event: 'page_view', user: 'user_456', page: '/dashboard' }
  },
  {
    id: '3',
    webhookId: '3',
    timestamp: '2024-01-15T09:15:00Z',
    status: 'failed',
    responseTime: 5000,
    payload: { source: 'external_api', content: 'article_789' },
    error: 'Connection timeout after 5000ms'
  }
];

export const WebhookManagement = () => {
  const [webhooks] = useState<WebhookConfig[]>(mockWebhooks);
  const [webhookEvents] = useState<WebhookEvent[]>(mockWebhookEvents);
  const [selectedWebhook, setSelectedWebhook] = useState<string | null>(null);

  const getStatusIcon = (status: WebhookConfig['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'paused':
        return <Pause className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getEventStatusIcon = (status: WebhookEvent['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const copyWebhookUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Webhook URL copied to clipboard!");
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const filteredEvents = selectedWebhook 
    ? webhookEvents.filter(event => event.webhookId === selectedWebhook)
    : webhookEvents;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Webhook Management</h2>
          <p className="text-gray-600 mt-1">Configure and monitor your webhook endpoints</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Webhook className="w-4 h-4 mr-2" />
          Create Webhook
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="events">Event History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Webhooks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{webhooks.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Active</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {webhooks.filter(w => w.status === 'active').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Calls Today</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,247</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">98.7%</div>
              </CardContent>
            </Card>
          </div>

          {/* Webhooks List */}
          <Card>
            <CardHeader>
              <CardTitle>Configured Webhooks</CardTitle>
              <CardDescription>Manage your webhook endpoints and monitor their performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {webhooks.map((webhook) => (
                  <div key={webhook.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {getStatusIcon(webhook.status)}
                          <h3 className="font-semibold text-gray-900">{webhook.name}</h3>
                          <Badge variant={webhook.status === 'active' ? 'default' : webhook.status === 'error' ? 'destructive' : 'secondary'}>
                            {webhook.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{webhook.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Last triggered: {formatTimestamp(webhook.lastTriggered)}</span>
                          <span>Total calls: {webhook.totalCalls.toLocaleString()}</span>
                          <span>Success rate: {webhook.successRate}%</span>
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                          <code className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-700 flex-1">
                            {webhook.url}
                          </code>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => copyWebhookUrl(webhook.url)}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Play className="w-4 h-4 mr-2" />
                            Test
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => setSelectedWebhook(webhook.id)}
                          >
                            <Clock className="w-4 h-4 mr-2" />
                            View Events
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Webhook Events</CardTitle>
              <CardDescription>
                Monitor webhook execution history and performance
                {selectedWebhook && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="ml-2"
                    onClick={() => setSelectedWebhook(null)}
                  >
                    Show All Events
                  </Button>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Webhook</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Response Time</TableHead>
                    <TableHead>Payload</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.map((event) => {
                    const webhook = webhooks.find(w => w.id === event.webhookId);
                    return (
                      <TableRow key={event.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getEventStatusIcon(event.status)}
                            <span className="capitalize">{event.status}</span>
                          </div>
                        </TableCell>
                        <TableCell>{webhook?.name}</TableCell>
                        <TableCell>{formatTimestamp(event.timestamp)}</TableCell>
                        <TableCell>
                          <Badge variant={event.responseTime > 1000 ? 'destructive' : 'secondary'}>
                            {event.responseTime}ms
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                            {JSON.stringify(event.payload).substring(0, 50)}...
                          </code>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Webhook Settings</CardTitle>
              <CardDescription>Configure global webhook settings and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Retry Failed Webhooks</h4>
                  <p className="text-sm text-gray-500">Automatically retry failed webhook calls</p>
                </div>
                <Button variant="outline">Configure</Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Rate Limiting</h4>
                  <p className="text-sm text-gray-500">Set rate limits for webhook calls</p>
                </div>
                <Button variant="outline">Configure</Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Security Settings</h4>
                  <p className="text-sm text-gray-500">Configure webhook security and authentication</p>
                </div>
                <Button variant="outline">Configure</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};