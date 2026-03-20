
import React from 'react';
import { 
  Users, 
  MessageSquare, 
  Calendar, 
  Brain, 
  Settings, 
  Search, 
  BarChart3,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface ContactsSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  currentView: 'contacts' | 'opportunities';
  onViewChange: (view: 'contacts' | 'opportunities') => void;
}

export const ContactsSidebar = ({ collapsed, onToggle, currentView, onViewChange }: ContactsSidebarProps) => {
  const menuItems = [
    { 
      icon: Users, 
      label: 'All Contacts', 
      count: 24, 
      active: currentView === 'contacts',
      view: 'contacts' as const
    },
    { 
      icon: TrendingUp, 
      label: 'Opportunities', 
      count: 18, 
      active: currentView === 'opportunities',
      view: 'opportunities' as const
    },
    { icon: MessageSquare, label: 'Recent Chats', count: 8 },
    { icon: Phone, label: 'Voice Calls', count: 12 },
    { icon: Mail, label: 'Email Threads', count: 15 },
    { icon: Calendar, label: 'Meetings', count: 6 },
    { icon: BarChart3, label: 'Analytics' },
    { icon: Brain, label: 'AI Insights' },
  ];

  if (collapsed) {
    return (
      <div className="w-16 bg-slate-900 text-white transition-all duration-300 flex flex-col">
        <div className="p-4 border-b border-slate-700">
          <button
            onClick={onToggle}
            className="p-1 hover:bg-slate-700 rounded transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 bg-slate-900 text-white transition-all duration-300 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <span className="font-semibold text-lg">thunai</span>
          </div>
          <button
            onClick={onToggle}
            className="p-1 hover:bg-slate-700 rounded transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 px-2">
        {menuItems.map((item, index) => (
          <div
            key={index}
            onClick={() => item.view && onViewChange(item.view)}
            className={`flex items-center justify-between px-3 py-3 mb-1 rounded-lg cursor-pointer transition-colors ${
              item.active ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center space-x-3">
              <item.icon size={20} />
              <span className="text-sm font-medium">{item.label}</span>
            </div>
            {item.count && (
              <span className="bg-slate-700 text-xs px-2 py-1 rounded-full">
                {item.count}
              </span>
            )}
          </div>
        ))}
      </nav>

      {/* Settings */}
      <div className="p-4 border-t border-slate-700">
        <Link 
          to="/companion/revai/settings"
          className="flex items-center space-x-3 px-3 py-2 text-slate-300 hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
        >
          <Settings size={20} />
          <span className="text-sm">Settings</span>
        </Link>
      </div>
    </div>
  );
};
