import { Link, useLocation } from 'react-router-dom';
import { Users, TrendingUp, Settings, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TopNavProps {
  onOpenSidekick: () => void;
}

export const TopNav = ({ onOpenSidekick }: TopNavProps) => {
  const location = useLocation();

  const navItems = [
    { to: '/companion/revai/settings', label: 'Settings', icon: Settings, matchPaths: ['/companion/revai/settings'] },
    { to: '/companion/revai/contacts', label: 'Contacts', icon: Users, matchPaths: ['/companion/revai', '/companion/revai/', '/companion/revai/contacts'] },
    { to: '/companion/revai/opportunities', label: 'Opportunities', icon: TrendingUp, matchPaths: ['/companion/revai/opportunities'] },
  ];

  return (
    <div className="h-14 bg-slate-900 border-b border-slate-700 flex items-center justify-between px-6 flex-shrink-0">
      <div className="flex items-center space-x-6">
        {/* Logo */}
        {/* <Link to="/" className="flex items-center space-x-2">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">T</span>
          </div>
          <span className="text-white font-semibold text-lg">thunai</span>
        </Link> */}

        {/* <div className="h-6 w-px bg-slate-700" /> */}

        {/* Nav Links */}
        <nav className="flex items-center space-x-1">
          {navItems.map((item) => {
            const isActive = item.matchPaths?.includes(location.pathname);
            return (
              <Link
                key={item.label}
                to={item.to}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${isActive
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
              >
                <item.icon size={16} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Revenue Sidekick */}
      <Button
        onClick={onOpenSidekick}
        variant="outline"
        size="sm"
        className="border-blue-500 text-blue-400 hover:bg-blue-600 hover:text-white bg-transparent gap-2"
      >
        <Bot size={16} />
        Revenue Sidekick
      </Button>
    </div>
  );
};
