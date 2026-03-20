import React, { useCallback, useMemo, useState } from 'react';
import { ContactsList } from '../components/contacts/ContactsList';
import { ContactDetail } from '../components/contacts/ContactDetail';
import { ContactsSidebar } from '../components/contacts/ContactsSidebar';

import { OpportunityDetail } from '../components/contacts/OpportunityDetail';
import { Opportunity } from '../types/Opportunity';
import { Contact } from "../types/Contact"
import { OpportunityFunnel } from '../types/OpportunityFunnelView';
import { isFunnelOpportunity } from '../lib/utils';

type ViewMode = "contacts" | "opportunities";

type OpenMode = "add" | "edit" | null;

const Contacts = () => {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | OpportunityFunnel | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [currentView, setCurrentView] = useState<ViewMode>('contacts');
  const [openContactDialog, setOpenContactDialog] = useState<OpenMode>(null);

  const showOpportunityFullscreen = useMemo(
    () => !!selectedOpportunity && !selectedContact,
    [selectedOpportunity, selectedContact]
  );

  const handleSelectContact = useCallback((contact: Contact) => {
    setSelectedContact(contact);
    setSelectedOpportunity(null);
  }, []);

  const handleSelectOpportunity = useCallback((opportunity: Opportunity | OpportunityFunnel) => {
    setSelectedOpportunity(opportunity);
    setSelectedContact(null);
  }, []);

  const handleBackFromOpportunity = useCallback(() => {
    setSelectedOpportunity(null);
  }, []);

  const handleCloseContact = useCallback(() => {
    setSelectedContact(null);
  }, []);

  // If showing opportunity in fullscreen mode
  if (showOpportunityFullscreen && selectedOpportunity) {
    return (
      <div className="h-full bg-gray-50">
        <OpportunityDetail
          opportunity={selectedOpportunity}
          onBack={handleBackFromOpportunity}
          type={isFunnelOpportunity(selectedOpportunity) ? "funnel" : "list"}
        />
      </div>
    );
  }

  return (
    <div className="flex h-full bg-gray-50">
      {/* <ContactsSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        currentView={currentView}
        onViewChange={setCurrentView}
      /> */}

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 flex overflow-hidden">
          <div className={`${selectedContact || selectedOpportunity ? 'w-1/3' : 'flex-1'} transition-all duration-300`}>
            <ContactsList
              onSelectContact={handleSelectContact}
              onSelectOpportunity={handleSelectOpportunity}
              selectedContact={selectedContact}
              currentView={currentView}
              openContactDialog={openContactDialog}
              setOpenContactDialog={setOpenContactDialog}
            />
          </div>

          {selectedContact && !selectedOpportunity && (
            <div className="flex-1 border-l border-gray-200">
              <ContactDetail
                contact={selectedContact}
                onClose={handleCloseContact}
                onSelectOpportunity={handleSelectOpportunity}
                openContactDialog={openContactDialog}
                setOpenContactDialog={setOpenContactDialog}
              />
            </div>
          )}

          {selectedOpportunity && !showOpportunityFullscreen && (
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

export default Contacts;
