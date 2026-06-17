import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Settings} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { getUserPreferences, updateUserPreferences } from '../../services/webSearch';
import { Loader2 } from 'lucide-react'; 
import { getconfiguration } from '../../services/configuration';
import { MCPToolConfiguration } from './mcptoolconfiguration';
import LogsDialog from './logsDialog';


interface SettingsPanelProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const SettingsPanel = ({ isOpen, onOpenChange }: SettingsPanelProps) => {
  const [open, setOpen] = useState(isOpen || false);
  const [webSearch, setWebSearch] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false); 
  const { toast } = useToast()

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    onOpenChange?.(newOpen);
    window.parent.postMessage({ popupOpen: newOpen }, '*');
  };


useEffect(() => {
  const fetchData = async () => {
    try {
      const userPref = await getconfiguration();
      // setWebSearch(userPref.websearch === true);
    } catch (error) {
      console.error("Could not fetch settings:", error);
      // toast({
      //   variant: "destructive",
      //   title: "Failed to load settings.",
      //   description: "There was an error loading your preferences. Please try again.",
      // });
    }
  };

  fetchData();
}, []);

const toggleWebSearch = async () => {
  const newValue = !webSearch;
  setWebSearch(newValue);
  setIsUpdating(true); // start loader

  try {
    await updateUserPreferences({
      websearch: newValue,
      enrich_smart_query: true,
    });

    toast({
      title: "Web Search Updated",
      description: `Web search is now ${newValue ? 'enabled' : 'disabled'}.`,
      duration: 3000,
    });
  } catch (error) {
    console.error("Could not update settings:", error);
    setWebSearch(!newValue); 
    toast({
      variant: "destructive",
      title: "Failed to update settings.",
      description: "There was an error saving your preferences. Please try again.",
      duration: 3000,
    });
  } finally {
    setIsUpdating(false); 
  }}
const [selectedMcpTools, setSelectedMcpTools] = useState<string[]>([]);



  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="mr-[35px]">
          <Settings className="h-4 w-4" />
        </Button>
      </SheetTrigger>
     <SheetContent className="w-[600px] sm:w-[800px] flex flex-col h-full">
  <SheetHeader className="flex-none">
    <SheetTitle className="flex items-center gap-2">
      <Settings className="h-5 w-5" />
      Chat Settings
    </SheetTitle>
    <SheetDescription className='flex justify-between items-center'>
      <span>Configure your chat experience</span>
      <LogsDialog />
    </SheetDescription>
  </SheetHeader>

  {/* Scrollable content area */}
  <div className="flex-1">
    
    <MCPToolConfiguration
      selectedTools={selectedMcpTools}
      onChange={(tools) => setSelectedMcpTools(tools)}
    />
  </div>

    </SheetContent>
    </Sheet>
  );
};
