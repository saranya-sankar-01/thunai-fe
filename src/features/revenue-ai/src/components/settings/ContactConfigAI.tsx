
import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Users, Shield, } from 'lucide-react';
import { DomainFilterConfig } from './DomainFilterConfig';
import { ContactCustomFields } from './ContactCustomFields';

export const ContactConfigAI = () => {
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({});

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      <div className="p-6 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center space-x-3 mb-2">
          <Users className="text-blue-600" size={24} />
          <h1 className="text-2xl font-bold text-gray-900">Contact AI Configuration</h1>
        </div>
        <p className="text-gray-600">Configure how AI manages and processes your contacts.</p>
      </div>

      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="p-6 space-y-6">
            <ContactCustomFields />
            {/* Domain Filtering */}
            <Collapsible>
              <CollapsibleTrigger
                className="flex items-center justify-between w-full p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                onClick={() => toggleSection('domains')}
              >
                <div className="flex items-center space-x-3">
                  <Shield className="text-red-600" size={20} />
                  <h2 className="text-lg font-semibold text-gray-900">Domain Filtering</h2>
                </div>
                {expandedSections['domains'] ? (
                  <ChevronDown className="text-gray-500" size={20} />
                ) : (
                  <ChevronRight className="text-gray-500" size={20} />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4 p-4 bg-gray-50 rounded-lg">
                <DomainFilterConfig
                  title="Exclude Domains from Contacts"
                  description="Contacts from these domains will be filtered out. This applies to both opportunity creation and contact management."
                  showContactCreationFlag={true}
                />
              </CollapsibleContent>
            </Collapsible>

            {/* AI Training Actions */}
            {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">AI Training</h2>
              <p className="text-sm text-gray-600 mb-4">
                Train the AI model with your contact management preferences and rules.
              </p>
              <div className="flex space-x-3">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Bot size={16} className="mr-2" />
                  Retrain AI Model
                </Button>
                <Button variant="outline">
                  Test Configuration
                </Button>
              </div>
            </div> */}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
