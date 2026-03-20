import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Link2, Unlink, CheckCircle, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCrmStore } from '../../store/crmStore';
import { Application } from '../../types/Application';
import { isAppConnected } from '../../lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Sheet, SheetContent } from '../ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { DynamicFields } from './DynamicFields';

interface CRMConnection {
  id: string;
  name: string;
  type: 'salesforce' | 'hubspot' | 'pipedrive' | 'zoho' | 'dynamics' | 'custom';
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: string;
  syncEnabled: boolean;
  syncFields: string[];
  webhookUrl?: string;
}

const crmProviders = [
  { type: 'salesforce', name: 'Salesforce', icon: '☁️', description: 'Sync contacts, deals, and activities with Salesforce.' },
  { type: 'hubspot', name: 'HubSpot', icon: '🟠', description: 'Two-way sync with HubSpot CRM for contacts and deals.' },
  { type: 'pipedrive', name: 'Pipedrive', icon: '🟢', description: 'Connect your Pipedrive pipeline and contacts.' },
  { type: 'zoho', name: 'Zoho CRM', icon: '🔴', description: 'Integrate with Zoho CRM for complete data sync.' },
  { type: 'dynamics', name: 'Microsoft Dynamics', icon: '🔷', description: 'Connect to Microsoft Dynamics 365 for enterprise CRM sync.' },
  { type: 'custom', name: 'Custom Webhook', icon: '🔗', description: 'Use a custom webhook URL to sync with any CRM.' },
] as const;

const syncFieldOptions = [
  'Contacts', 'Opportunities', 'Activities', 'Notes', 'Meetings', 'Emails', 'Tasks', 'Custom Fields'
];

interface CRMConnectionsConfigProps {
  connections: CRMConnection[];
  onConnectionsChange: (connections: CRMConnection[]) => void;
}

export const CRMConnectionsConfig = ({ connections, onConnectionsChange }: CRMConnectionsConfigProps) => {
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [appToDisconnect, setAppToDisconnect] = useState<Application | null>(null);
  const [viewConnectedAccount, setViewConnectedAccount] = useState<boolean>(false);
  const { toast } = useToast();

  const { applications, loading, loadCrmApplications, enableCRM, disconnectApp, connectApplication, manualSync } = useCrmStore();

  useEffect(() => {
    loadCrmApplications();
  }, []);


  // const handleConnect = (type: string) => {
  //   if (type === 'custom' && !webhookInput.trim()) {
  //     toast({ title: 'Error', description: 'Please enter a webhook URL.', variant: 'destructive' });
  //     return;
  //   }

  //   const provider = crmProviders.find(p => p.type === type);
  //   const newConnection: CRMConnection = {
  //     id: `crm-${Date.now()}`,
  //     name: provider?.name || type,
  //     type: type as CRMConnection['type'],
  //     status: 'connected',
  //     lastSync: 'Just now',
  //     syncEnabled: true,
  //     syncFields: ['Contacts', 'Opportunities', 'Activities'],
  //     webhookUrl: type === 'custom' ? webhookInput : undefined,
  //   };

  //   onConnectionsChange([...connections, newConnection]);
  //   setSelectedApp(null);
  //   setApiKeyInput('');
  //   setWebhookInput('');
  //   toast({ title: 'CRM Connected', description: `${provider?.name} connected successfully.` });
  // };



  const handleDisconnect = (id: string) => {
    onConnectionsChange(connections.filter(c => c.id !== id));
    toast({ title: 'Disconnected', description: 'CRM connection removed.' });
  };

  const toggleSyncField = (connectionId: string, field: string) => {
    onConnectionsChange(connections.map(c => {
      if (c.id !== connectionId) return c;
      const fields = c.syncFields.includes(field)
        ? c.syncFields.filter(f => f !== field)
        : [...c.syncFields, field];
      return { ...c, syncFields: fields };
    }));
  };

  const triggerSync = async (application: Application) => {
    await manualSync({ app_name: application.name })
  };

  const showManageAccountButton = (connection: Application): boolean => {
    if (!connection) return false;

    const hasNoFields =
      !connection.fields || Object.keys(connection.fields).length === 0;
    const hasAppId = !!connection.application_id;

    return connection.multiple_account && (hasNoFields || hasAppId);
  };

  const disconnectApplication = async (index?: number) => {
    if (!appToDisconnect) return;
    let success: boolean = false;

    if (appToDisconnect.name === "salesforce") {
      success = await disconnectApp(appToDisconnect, "DISCONNECT_OAUTH");
    }
    else if (showManageAccountButton(appToDisconnect)) {
      success = await disconnectApp(appToDisconnect, "DELINK_PARTICULAR_ACC", index);
    } else {
      success = await disconnectApp(appToDisconnect);
    }

    if (success) {
      setAppToDisconnect(null)
    }
  }

  const handleConnect = (application: Application) => {
    setSelectedApp(application);
    connectApplication(application);
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Link2 className="text-purple-600" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">CRM Connections</h2>
            <p className="text-sm text-gray-600">Connect your CRM for seamless data sync across contacts, deals, and activities.</p>
          </div>
        </div>
      </div>

      {/* Active Connections */}
      {/* {applications.filter(app => isAppConnected(app)).length > 0 && ( */}
      <div className="mb-6">
        <div className="space-y-4">
          {loading.applicationsLoading && <div className="flex justify-center items-center h-full">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
            Loading...
          </div>}
          {!loading.applicationsLoading && !applications.length && <div className="px-6 py-12 text-center text-gray-500">
            No CRM Applications found.
          </div>}
          {(!loading.applicationsLoading && applications.length > 0) && applications.map(connection => {
            return (
              <div key={connection.id} className="bg-white border border-gray-200 rounded-lg p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      <img src={connection.logo} alt={`Logo of ${connection.name}`} className="w-10 h-10 cover" />
                    </span>
                    <div>
                      <h4 className="font-medium text-gray-900">{connection.name}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        {(isAppConnected(connection)) && (
                          <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50 text-xs">
                            <CheckCircle size={10} className="mr-1" /> Connected
                          </Badge>
                        )}
                        {/* {connection.lastSync && (
                            <span className="text-xs text-gray-500">Last sync: {connection.lastSync}</span>
                          )} */}
                      </div>
                    </div>
                  </div>
                  {!isAppConnected(connection) && (
                    <Button size="sm" variant="outline" onClick={() => handleConnect(connection)}>
                      <Plus size={14} className="mr-1" /> Connect
                    </Button>
                  )}
                  {(isAppConnected(connection)) && (
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => triggerSync(connection)}>
                        <RefreshCw size={14} className="mr-1" /> {loading.manualSyncing ? "Syncing" : "Sync Now"}
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => setAppToDisconnect(connection)}>
                        <Unlink size={14} className="mr-1" /> Disconnect
                      </Button>
                    </div>
                  )}
                  {(showManageAccountButton(connection)) && (
                    <button className="flex items-center justify-center text-gray-600 border border-gray-300 rounded-md px-3 py-1 shadow transition-all duration-200 min-w-[100px] text-xs cursor-pointer hover:bg-gray-50 sm:px-4 sm:text-sm" onClick={() => {
                      setViewConnectedAccount(true)
                      setSelectedApp(connection)
                    }}>
                      Manage Account
                    </button>
                  )}
                </div>
                {(isAppConnected(connection)) && (
                  <div className="flex items-center justify-between mb-3 p-2 bg-gray-50 rounded">
                    <Label className="text-xs">Auto-sync enabled</Label>
                    <Switch checked={connection.revenue_enabled} onCheckedChange={(check) => enableCRM({ crm_app: connection.name, enabled: check })} />
                  </div>
                )}

                {selectedApp?.name === connection.name && (
                  <div className="space-y-3">
                    <DynamicFields application={connection} setSelectedApp={setSelectedApp} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Dialog open={!!appToDisconnect} onOpenChange={() => setAppToDisconnect(null)}>
        <DialogContent aria-describedby=''>
          <DialogHeader>
            <DialogTitle>Disconnect Application</DialogTitle>
            <DialogDescription>
              Are you sure want to Disconnect this Application?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => disconnectApplication()}>Disconnect</Button>
            <Button variant='outline' onClick={() => setAppToDisconnect(null)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet open={viewConnectedAccount} onOpenChange={setViewConnectedAccount}>
        <SheetContent side="right" className="w-full sm:max-w-lg p-0 flex flex-col [&>button]:hidden">
          <div className="bg-white dark:bg-gray-800 rounded-l-2xl shadow-2xl w-full max-w-md h-full transform transition-transform duration-300 ease-in-out translate-x-0 overflow-hidden">
            <div className="p-6 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    Connected Accounts
                  </h2>
                </div>
                <TooltipProvider>
                  <Tooltip >
                    <TooltipTrigger>
                      <Button variant='ghost'>
                        <Plus size={14} className="mr-1" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Add Account</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(100vh-150px)]">
              {/* No Connected Accounts Message */}
              {selectedApp?.application_identities?.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-lg">
                  <div className="text-center">
                    <div className="mb-6 opacity-60"></div>
                    <p className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                      No Connected Accounts
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      Connect your first account to get started
                    </p>
                  </div>
                </div>
              )}

              {/* Connected Accounts List */}
              {selectedApp?.application_identities?.map((app, i) => (
                <div key={i} className="flex items-center justify-between p-4 mb-3 bg-white dark:bg-gray-700 rounded-xl shadow-sm hover:shadow-md transition-all group">
                  <div className="flex items-center space-x-4">
                    <span className="material-icons text-indigo-500 dark:text-indigo-400">
                      account_circle
                    </span>
                    <span className="text-gray-800 dark:text-gray-200 font-medium">
                      {app}
                    </span>
                  </div>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => setAppToDisconnect(selectedApp)}>
                    <Unlink size={14} className="mr-1" /> Disconnect
                  </Button>

                </div>
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
