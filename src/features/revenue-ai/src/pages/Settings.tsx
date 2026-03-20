import React, { useState } from 'react';
import { SettingsSidebar } from '../components/settings/SettingsSidebar';
import { OpportunityConfigAI } from '../components/settings/OpportunityConfigAI';
import { ContactConfigAI } from '../components/settings/ContactConfigAI';
import { ActivityStatusConfig } from '../components/settings/ActivityStatusConfig';
import { CurrencyConfig } from '../components/settings/CurrencyConfig';
import { CRMConnectionsConfig } from '../components/settings/CRMConnectionsConfig';
import { UserManagementConfig } from '../components/settings/UserManagementConfig';

export interface OpportunityConfig {
  definition: string;
  maturityIndicators: string[];
  stages: {
    name: string;
    description: string;
    criteria: string[];
  }[];
  confidenceThresholds: {
    low: number;
    medium: number;
    high: number;
  };
  excludedDomains: string[];
}

export interface ContactConfig {
  excludedDomains: string[];
  autoTaggingRules: {
    domain: string;
    tags: string[];
  }[];
  engagementScoreWeights: {
    emailResponse: number;
    meetingAttendance: number;
    documentOpens: number;
    websiteVisits: number;
  };
}

const defaultActivityStatuses = [
  'Connected', 'Voicemail', 'No Answer', 'Busy', 'Wrong Number', 'Left Message', 'Callback Requested', 'Not Interested'
];

const Settings = () => {
  const [selectedSection, setSelectedSection] = useState('opportunities');
  const [activityStatuses, setActivityStatuses] = useState(defaultActivityStatuses);
  const [defaultCurrency, setDefaultCurrency] = useState('USD');
  const [enabledCurrencies, setEnabledCurrencies] = useState(['USD', 'EUR', 'GBP', 'INR']);
  const [crmConnections, setCrmConnections] = useState<any[]>([]);

  return (
    <div className="flex h-full bg-gray-50">
      <SettingsSidebar
        selectedSection={selectedSection}
        onSectionChange={setSelectedSection}
      />

      <div className="flex-1 overflow-auto">
        {selectedSection === 'opportunities' && <OpportunityConfigAI />}
        {selectedSection === 'contacts' && <ContactConfigAI />}
        {selectedSection === 'user-management' && <UserManagementConfig />}
        {selectedSection === 'activity-statuses' && (
          <ActivityStatusConfig statuses={activityStatuses} onStatusesChange={setActivityStatuses} />
        )}
        {selectedSection === 'currency' && (
          <CurrencyConfig
            defaultCurrency={defaultCurrency}
            enabledCurrencies={enabledCurrencies}
            onDefaultCurrencyChange={setDefaultCurrency}
            onEnabledCurrenciesChange={setEnabledCurrencies}
          />
        )}
        {selectedSection === 'crm-connections' && (
          <CRMConnectionsConfig connections={crmConnections} onConnectionsChange={setCrmConnections} />
        )}
      </div>
    </div>
  );
};

export default Settings;
