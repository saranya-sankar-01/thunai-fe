
import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Globe, Shield, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useConfigStore } from '../../store/configStore';
import { Input } from '../ui/input';

interface DomainFilterConfigProps {
  title: string;
  description: string;
  showContactCreationFlag?: boolean;
}

export const DomainFilterConfig = ({
  title,
  description,
  showContactCreationFlag = false
}: DomainFilterConfigProps) => {
  const [newDomain, setNewDomain] = useState('');
  const [applyToContactCreation, setApplyToContactCreation] = useState(true);
  const { toast } = useToast();

  const { settingConfiguration, loadConfig, config, loading } = useConfigStore();

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  console.log(config);

  const addDomain = async () => {
    if (!newDomain.trim()) return;
    if (config.ignored_domains.includes(newDomain.trim())) {
      toast({
        title: "Domain already exists",
        description: "This domain is already in the exclusion list.",
        variant: "destructive"
      });
      return;
    }

    await settingConfiguration({ currency: config.currency, ignored_domains: [newDomain] })

    setNewDomain('');
    toast({
      title: "Domain added",
      description: `${newDomain.trim()} has been added to the exclusion list.`
    });
  };

  const removeDomain = async (domain: string) => {
    const domains = config.ignored_domains.filter(dom => dom !== domain);
    await settingConfiguration({ currency: config.currency, ignored_domains: domains })
    toast({
      title: "Domain removed",
      description: `${domain} has been removed from the exclusion list.`
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-2">
        <Shield size={20} className="text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>

      <p className="text-sm text-gray-600 mb-4">{description}</p>

      {showContactCreationFlag && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <UserPlus size={18} className="text-blue-600" />
              <div>
                <h4 className="text-sm font-medium text-gray-900">Apply to Contact Creation</h4>
                <p className="text-xs text-gray-600">Prevent contacts from excluded domains from being added</p>
              </div>
            </div>
            <Switch
              checked={applyToContactCreation}
              onCheckedChange={setApplyToContactCreation}
            />
          </div>
        </div>
      )}

      <div className="flex space-x-2 mb-4">
        <Input
          type="text"
          placeholder="e.g., spam-domain.com"
          value={newDomain}
          onChange={(e) => setNewDomain(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addDomain()}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Button onClick={addDomain} disabled={!newDomain.trim()}>
          <Plus size={16} className="mr-1" />
          Add Domain
        </Button>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700">Excluded Domains ({config.ignored_domains?.length})</h4>
        {!config.ignored_domains ? (
          <p className="text-sm text-gray-500 italic">No domains excluded yet</p>
        ) : (
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {config.ignored_domains.map((domain) => (
              <div key={domain} className="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg p-2">
                <div className="flex items-center space-x-2">
                  <Globe size={14} className="text-red-600" />
                  <span className="text-sm text-red-900">{domain}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeDomain(domain)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-100"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
