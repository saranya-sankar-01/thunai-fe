// import { Button } from "@/components/ui/button";
// import { Shield, Save, Loader2, Check,X } from "lucide-react";
// import { useState } from "react";
// import { TestAgentModal } from "./TestAgentModal";
// import { useToast } from "@/hooks/use-toast";
// interface AgentActionBarProps {
//   onSave: () => Promise<void> 
//     widgetId?: string;
//      interfaces?: {
//     voice?: { enabled: boolean };
//     chatbox?: { enabled: boolean };
//   };
//     showTestButton?: boolean;
// }

// export function AgentActionBar({ onSave, widgetId ,interfaces ,showTestButton }: AgentActionBarProps) {
//   const [isTestModalOpen, setIsTestModalOpen] = useState(false);
//   const { toast } = useToast();
// const [isSaving, setIsSaving] = useState(false);
//   const [isSaved, setIsSaved] = useState(false);
// const [canShowTest, setCanShowTest] = useState(showTestButton || false);
//    const handleSaveAgent = async () => {
//     try {
//       setIsSaving(true);
//       setIsSaved(false);

//       await onSave(); 

//       setIsSaved(true);
//       toast({
//         title: "Agent Saved",
//         description: "Your agent has been saved successfully.",
//       });
//   // const canTestAgent = interfaces?.voice?.enabled || interfaces?.chatbox?.enabled;
//   //     setCanShowTest(canTestAgent);

//       // Reset "Saved" state after a short delay
//       setTimeout(() => setIsSaved(false), 2000);
//     } catch (err) {
//       console.log(err);
      
//     const message =
//       err?.message ||
//       err?.response?.data?.message || // axios
//       err?.message?.message ||        // nested
//       String(err);

//     toast({
//       title: "Save Failed",
//       description: message || "Something went wrong",
//       variant: "destructive",
//     });
//     } finally {
//       setIsSaving(false);
//     }
//   };


//   const handleTestAgent = () => {
//     setIsTestModalOpen(!isTestModalOpen);
//   };
//    const shouldShowTestButton = showTestButton || canShowTest;
//   return (
//     <>
//       <div className="flex items-center gap-3">
//         <Button
//           onClick={handleSaveAgent}
//           disabled={isSaving}
//           className="bg-thunai-primary hover:bg-thunai-primary/90 text-white shadow-soft font-medium transition-smooth"
//         >
//           {isSaving ? (
//             <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//           ) : isSaved ? (
//             <Check className="h-4 w-4 mr-2 text-green-400" />
//           ) : (
//             <Save className="h-4 w-4 mr-2" />
//           )}
//           {isSaving ? "Saving..." : isSaved ? "Saved!" : "Save Agent"}
//         </Button>
//          {shouldShowTestButton && (
//           <Button 
//             variant="outline" 
//             onClick={handleTestAgent}
//             className="border-thunai-primary text-thunai-primary hover:bg-thunai-primary hover:text-white transition-smooth"
//           >
//             {isTestModalOpen ? (
//               <>
//                 <X className="h-4 w-4 mr-2" />
//                 Close Agent
//               </>
//             ) : (
//               <>
//                 <Shield className="h-4 w-4 mr-2" />
//                 Test Agent
//               </>
//             )}
//           </Button>
//         )}
//       </div>

//       <TestAgentModal 
//        widgetId={widgetId}
//         open={isTestModalOpen} 
//         onOpenChange={setIsTestModalOpen} 
//       />
//     </>
//   );
// }

import { Button } from "@/components/ui/button";
import { Shield, Save, Loader2, Check, X } from "lucide-react";
import { useState, useEffect } from "react";
import { TestAgentModal } from "./TestAgentModal";
import { useToast } from "@/hooks/use-toast";

interface AgentActionBarProps {
  onSave: () => Promise<any>;
  widgetId?: string;
  interfaces?: {
    voice?: { enabled: boolean };
    chatbox?: { enabled: boolean };
  };
  initialInterfaces?: string[];
  testAgentSaved?:boolean
}

export function AgentActionBar({ 
  onSave, 
  widgetId, 
  interfaces, 
  initialInterfaces = [], 
  testAgentSaved: propTestAgentSaved = false 
}: AgentActionBarProps) {
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [savedInterfaces, setSavedInterfaces] = useState<string[]>(initialInterfaces);
  const [savedWidgetId, setSavedWidgetId] = useState<string | undefined>(widgetId);
  const [testAgentSaved, setTestAgentSaved] = useState(false);

  useEffect(() => {
    if (widgetId) {
      setSavedWidgetId(widgetId);
    }
  }, [widgetId]);
  useEffect(() => {
    setTestAgentSaved(propTestAgentSaved);
  }, [propTestAgentSaved]);

const currentInterfacesEnabled = interfaces?.voice?.enabled || interfaces?.chatbox?.enabled;
  const shouldShowTestButton = testAgentSaved && currentInterfacesEnabled;

  const handleSaveAgent = async () => {
    try {
      setIsSaving(true);
      setIsSaved(false);

      const result = await onSave();
      // console.log('Save result:', result);

      // Check the response for enabled interfaces and widget ID
      if (result && result.data) {
        if (result.data.interface && Array.isArray(result.data.interface)) {
          setSavedInterfaces(result.data.interface);
        }
        if (result.data.widget_id) {
          setSavedWidgetId(result.data.widget_id);
        }
      }
      if (currentInterfacesEnabled) {
        setTestAgentSaved(true);
      }
    setIsTestModalOpen(false);
      setIsSaved(true);
      toast({
        title: "Agent Saved",
        description: "Your agent has been saved successfully.",
      });

      setTimeout(() => setIsSaved(false), 2000);
    } catch (err) {
      console.log(err);
      
      const message =
        err?.message ||
        err?.response?.data?.message ||
        err?.message?.message ||
        String(err);

      toast({
        title: "Save Failed",
        description: message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestAgent = () => {
    setIsTestModalOpen(!isTestModalOpen);
  };

  return (
    <>
      <div className="flex items-center gap-3">
        <Button
          onClick={handleSaveAgent}
          disabled={isSaving}
          className="bg-thunai-primary hover:bg-thunai-primary/90 text-white shadow-soft font-medium transition-smooth"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : isSaved ? (
            <Check className="h-4 w-4 mr-2 text-green-400" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {isSaving ? "Saving..." : isSaved ? "Saved!" : "Save Agent"}
        </Button>
         {shouldShowTestButton && (
          <Button 
            variant="outline" 
            onClick={handleTestAgent}
            className="border-thunai-primary text-thunai-primary hover:bg-thunai-primary hover:text-white transition-smooth"
          >
            {isTestModalOpen ? (
              <>
                <X className="h-4 w-4 mr-2" />
                Close Agent
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Test Agent
              </>
            )}
          </Button>
        )}
      </div>

      <TestAgentModal 
        widgetId={savedWidgetId}
        open={isTestModalOpen} 
        onOpenChange={setIsTestModalOpen} 
      />
    </>
  );
}

