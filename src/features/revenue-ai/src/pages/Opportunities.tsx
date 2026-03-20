import React, { useState } from 'react';
import { ContactsList } from '../components/contacts/ContactsList';
import { ContactsSidebar } from '../components/contacts/ContactsSidebar';
import { OpportunityDetail } from '../components/contacts/OpportunityDetail';
import { Opportunity } from '../types/Opportunity';
import { isFunnelOpportunity } from '../lib/utils';
import { OpportunityFunnel } from '../types/OpportunityFunnelView';

const Opportunities = () => {
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | OpportunityFunnel | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  // console.log(selectedOpportunity, "SELECTED")

  const handleSelectOpportunity = (opportunity: Opportunity | OpportunityFunnel) => {
    setSelectedOpportunity(opportunity);
  };

  const handleBackFromOpportunity = () => {
    setSelectedOpportunity(null);
  };

  return (
    <div className="flex h-full bg-gray-50">
      {/* <ContactsSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        currentView="opportunities"
        onViewChange={() => {}}
      /> */}

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 flex overflow-hidden">
          <div className={`${selectedOpportunity ? 'w-1/3' : 'flex-1'} transition-all duration-300`}>
            <ContactsList
              onSelectContact={() => { }}
              onSelectOpportunity={handleSelectOpportunity}
              selectedContactId={undefined}
              currentView="opportunities"
            />
          </div>

          {selectedOpportunity && (
            <div className="flex-1 border-l border-gray-200">
              <OpportunityDetail
                opportunity={selectedOpportunity}
                onBack={handleBackFromOpportunity}
                type={isFunnelOpportunity(selectedOpportunity) ? "funnel" : "list"}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Opportunities;
