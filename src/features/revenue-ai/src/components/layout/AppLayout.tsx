import { useState } from 'react';
import { TopNav } from './TopNav';
import { RevenueSidekick } from './RevenueSidekick';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const [sidekickOpen, setSidekickOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen">
      <TopNav onOpenSidekick={() => setSidekickOpen(true)} />
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
      <RevenueSidekick open={sidekickOpen} onOpenChange={setSidekickOpen} />
    </div>
  );
};
