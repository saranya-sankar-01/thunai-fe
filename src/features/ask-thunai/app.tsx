import { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import Index from './src/pages/Index';
import AskThunaiIcon from '@/assets/images/ask-thunai.svg';
import './src/index.css';

const queryClient = new QueryClient();

type AskThunaiProps = {
  isSidebarCollapsed: boolean;
  isSettingsPage?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
};

function Askthunai({ isSidebarCollapsed, isSettingsPage = false, onOpenChange }: AskThunaiProps) {
  const [openChatbox, setOpenChatbox] = useState(false);

  const panelStyle = useMemo(() => {
    const isMobile = window.innerWidth < 1024;
    if (isMobile) return { left: '0px', width: '100%' };
    const left = isSidebarCollapsed ? 80 : 256;
    return {
      left: `${left}px`,
      width: `calc(100% - ${left}px)`,
      marginLeft: isSettingsPage ? '-12px' : '0px',
    };
  }, [isSidebarCollapsed, isSettingsPage]);

  return (
    <>
      {openChatbox && (
        <div
          className="shadow-xl bg-white border-t fixed z-40 top-[60px] h-[calc(100vh-60px)] transition-all duration-300 overflow-auto"
          style={panelStyle}
        >
          <button
            className="absolute top-4 right-4 z-50"
            onClick={() => { setOpenChatbox(false); onOpenChange?.(false); }}
            aria-label="Close Ask Thunai"
          >
            <X className="w-6 h-6 text-gray-500 hover:text-blue-500" />
          </button>

          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <Index />
            </TooltipProvider>
          </QueryClientProvider>
        </div>
      )}

      <div className="fixed bottom-4 right-4 md:right-20 flex justify-end items-end z-40">
        {!openChatbox && (
          <button
            onClick={() => { setOpenChatbox(true); onOpenChange?.(true); }}
            className="px-4 py-3 rounded-full bg-[#F3E6FF] border border-[#C484FF] text-[#0E121B] font-normal transition-all flex items-center gap-2"
            style={{ boxShadow: '0 1px 6px 2px rgba(130,88,169,0.16)' }}
          >
            <img src={AskThunaiIcon} alt="Ask Thunai" className="w-8 h-8 object-contain" />
            Ask Thunai
          </button>
        )}
      </div>
    </>
  );
}

export default Askthunai;