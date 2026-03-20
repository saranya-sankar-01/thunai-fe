
import React from 'react';
import { ArrowLeft, Home, Users, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ContactsHeaderProps {
  selectedContact: any;
  onBack: () => void;
  currentView: 'contacts' | 'opportunities';
  onViewChange: (view: 'contacts' | 'opportunities') => void;
}

export const ContactsHeader = ({ selectedContact, onBack, currentView, onViewChange }: ContactsHeaderProps) => {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link 
            to="/" 
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Home size={20} />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </Link>
          
          <div className="h-6 w-px bg-gray-300" />
          
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onViewChange('contacts')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'contacts' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Users size={16} />
              <span>Contacts</span>
            </button>
            
            <button
              onClick={() => onViewChange('opportunities')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'opportunities' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <TrendingUp size={16} />
              <span>Opportunities</span>
            </button>
          </div>
        </div>
        
        {selectedContact && (
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={16} />
            <span className="text-sm">Back to List</span>
          </button>
        )}
      </div>
    </div>
  );
};
