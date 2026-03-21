import { useState } from "react";
import { Menu } from "lucide-react";
import { Check } from "lucide-react";

interface Application {
  id: string;
  name?: string;
  display_name?: string;
  logo?: string;
  description?: string;
  docs_uri?: string;
  [key: string]: unknown;
}

interface FeatureSets {
  CHAT_AGENT?: string[];
  VOICE_AGENT?: string[];
  EMAIL_AGENT?: string[];
  [key: string]: string[] | undefined;
}

const QuickStartSidebar = ({ 
  selectedApps, 
  activeStep, 
  featureSets, 
  selectedAgentType 
}: { 
  selectedApps: Application[]; 
  activeStep: number; 
  featureSets: FeatureSets; 
  selectedAgentType?: string;
}) => {
  const [activeAppIndex, setActiveAppIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const activeApp = selectedApps[activeAppIndex];

  const getAgentFeatureKey = (agentType: string): string => {
    const mapping: { [key: string]: string } = {
      "Chat Agent": "CHAT_AGENT",
      "Voice Agent": "VOICE_AGENT",
      "Mail Agent": "EMAIL_AGENT",
    };
    return mapping[agentType] || "CHAT_AGENT";
  };
  

  const handleCopyDocLink = () => {
    if (activeApp?.docs_uri) {
      navigator.clipboard.writeText(activeApp.docs_uri);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  

  return (
    <>
    <div className="w-full lg:w-[400px] bg-white border-t lg:border-t-0 lg:border-l border-gray-200 p-4 sm:p-6 overflow-y-scroll scrollbar-thin max-h-[60vh] lg:max-h-none">
      <div className="flex items-center gap-2 mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-gray-200">
        <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-blue-500 text-white flex items-center justify-center flex-shrink-0">
          <Menu size={18} className="sm:w-5 sm:h-5" />
        </div>
        <h2 className="text-base sm:text-lg font-semibold text-gray-800 truncate">Quick Start Guide</h2>
      </div>
      {activeStep === 3 && (
        <div>
        {selectedApps.length> 0 ? (
        <div>
      <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-8">
        Your selected applications will be available for setup under{" "}
        <span className="font-semibold">Integrations → Applications</span> in the left menu.
      </p>

      {selectedApps.length > 1 && (
        <div className="mb-4 sm:mb-8 pb-4 sm:pb-8 border-b border-gray-200">
          <p className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wider">Applications</p>
          <div className="flex flex-col gap-2">
            {selectedApps.map((app, index) => (
              <button
                key={app.id}
                onClick={() => setActiveAppIndex(index)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left transition min-w-0 ${
                  activeAppIndex === index
                    ? "bg-blue-100 border border-blue-400"
                    : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
                }`}
              >
                <img src={app.logo} alt={app.display_name} className="h-5 w-5 object-contain flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-gray-800 truncate">
                  {app.display_name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      
      <div className="mb-4 sm:mb-8 pb-4 sm:pb-8 border-b border-gray-200">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <img
            src={activeApp?.logo}
            alt={activeApp?.display_name}
            className="h-10 w-10 sm:h-12 sm:w-12 object-contain flex-shrink-0"
          />
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 truncate">
            {activeApp?.display_name}
          </h3>
        </div>
      </div>

      <div className="mb-4 sm:mb-8 pb-4 sm:pb-8 border-b border-gray-200">
      <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-3 sm:mb-4 uppercase tracking-wide">
      Setup Instructions:
      </h4>
      <div className="space-y-2 sm:space-y-3">
      <div className="flex gap-2 sm:gap-3">
      <span className="text-xs sm:text-sm font-medium text-gray-800 min-w-fit">1.</span>
      <p className="text-xs sm:text-sm text-gray-700">Navigate to Integrations → Applications</p>
      </div>
      <div className="flex gap-2 sm:gap-3">
            <span className="text-xs sm:text-sm font-medium text-gray-800 min-w-fit">2.</span>
            <p className="text-xs sm:text-sm text-gray-700">
              Select {activeApp?.display_name} from the list
            </p>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <span className="text-xs sm:text-sm font-medium text-gray-800 min-w-fit">3.</span>
            <p className="text-xs sm:text-sm text-gray-700">
            Follow the on-screen instructions to authorize access
            </p>
            </div>
            <div className="flex gap-2 sm:gap-3">
            <span className="text-xs sm:text-sm font-medium text-gray-800 min-w-fit">4.</span>
            <a
              onClick={()=>window.open("https://docs.thunai.ai/?_gl=1*1ak8tud*_gcl_au*MjEzNzc4MzcxNC4xNzcwNjIwNTUx","_blank")}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
            >
              View Documentation →
            </a>
          </div>
        </div>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-4 mt-auto">
        <p className="text-xs sm:text-sm text-gray-600">
          Need help?{" "}
          <a href="#" className="text-blue-600 hover:text-blue-700 font-medium"
          onClick={()=>window.open("https://www.thunai.ai/?_gl=1*1lpw2ct*_gcl_au*MjEzNzc4MzcxNC4xNzcwNjIwNTUx","_blank")}>
          Contact support
          </a>
          </p>
          <button
          onClick={handleCopyDocLink}
          className={`w-full sm:w-auto px-3 py-1.5 sm:py-1 rounded-md text-xs sm:text-sm font-medium transition-colors flex-shrink-0 cursor-pointer ${
            copied
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
        {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>
      </div>
        </div>
      ):(<div className="flex justify-center items-center min-h-[200px] sm:min-h-[30vh] border-2 border-dashed border-gray-300 rounded-lg p-4">
        <div className="flex flex-col justify-center items-center text-center gap-2">
        
        <h6 className="text-xs sm:text-sm text-gray-600">
        No applications selected
        </h6>
        <p className="text-gray-400 text-xs sm:text-sm">Select applications from the main panel to see their setup guides.</p>
        </div>
        </div>)}
        </div>
      )}
      {activeStep === 4 && selectedAgentType && (
        <div className="min-w-0">
          <div className="mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">{selectedAgentType}</h3>
            <h6 className="text-sm sm:text-base text-gray-700">Thunai AI offers AI-powered voice agents that enable AI-driven interactions within various applications.</h6>
          </div>

          {featureSets[getAgentFeatureKey(selectedAgentType)] && featureSets[getAgentFeatureKey(selectedAgentType)]!.length > 0 ? (
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-3 sm:mb-4 uppercase tracking-wide">Key Features:</h4>
              <ul className="space-y-2 sm:space-y-3">
                {featureSets[getAgentFeatureKey(selectedAgentType)]?.map((feature: string, index: number) => (
                  <li key={index} className="flex gap-2 min-w-0">
                    <Check size={14} className="text-blue-700 mt-0.5 font-bold min-w-fit flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-4 mt-6 sm:mt-8 border-t border-gray-200">
                <p className="text-xs sm:text-sm text-gray-600">
                  Need help?{" "}
                  <a href="#" className="text-blue-600 hover:text-blue-700 font-medium"
                  onClick={()=>window.open("https://docs.thunai.ai/category/65-voice-agents","_blank")}>
                  Learn more about {selectedAgentType}
                  </a>
                </p>
              </div>
            </div>
          ) : (
            <p className="text-xs sm:text-sm text-gray-600">No features available for this agent type.</p>
          )}
        </div>
      )}
    </div>
        </>
  );
};

export default QuickStartSidebar;
