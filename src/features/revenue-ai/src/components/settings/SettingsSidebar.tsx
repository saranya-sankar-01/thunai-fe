
import React from 'react';
import { Settings, TrendingUp, Users, Bell, Shield, Palette, Activity, DollarSign, Link2 } from 'lucide-react';

interface SettingsSidebarProps {
  selectedSection: string;
  onSectionChange: (section: string) => void;
}

export const SettingsSidebar = ({ selectedSection, onSectionChange }: SettingsSidebarProps) => {
  const sections = [
    { id: 'opportunities', label: 'Opportunity Settings', icon: TrendingUp },
    { id: 'contacts', label: 'Contact Settings', icon: Users },
    { id: 'user-management', label: 'User Management', icon: Users },
    { id: 'activity-statuses', label: 'Activity Statuses', icon: Activity },
    { id: 'currency', label: 'Currency', icon: DollarSign },
    { id: 'crm-connections', label: 'CRM Connections', icon: Link2 },
    // { id: 'notifications', label: 'Notifications', icon: Bell },
    // { id: 'security', label: 'Security', icon: Shield },
    // { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

  return (
    <div className="w-64 h-full bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <Settings className="text-gray-600" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
            <p className="text-sm text-gray-600">Configure your preferences</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => onSectionChange(section.id)}
            className={`w-full flex items-center space-x-3 px-3 py-3 mb-2 rounded-lg text-left transition-colors ${selectedSection === section.id
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'text-gray-700 hover:bg-gray-50'
              }`}
          >
            <section.icon size={18} />
            <span className="text-sm font-medium">{section.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};
