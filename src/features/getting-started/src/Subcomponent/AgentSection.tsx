import { useRef, useImperativeHandle, forwardRef } from 'react';
import CreateAgentIcon from "../assets/svg/CreateAgent.svg";
import ChatIcon from "../assets/svg/ChatIcon.svg";
import ChatIconBlack from "../assets/svg/ChatIconBlack.svg";
import VoiceAgentIcon from "../assets/svg/VoiceAgent.svg";
import VoiceAgentIconBlack from "../assets/svg/VoiceAgentBlack.svg";
import MailIcon from "../assets/svg/MailIcon.svg";
import MailIconBlack from "../assets/svg/MailIconBlack.svg";
import StarIcon from "../assets/svg/StarIcon.svg";
import { getLocalStorageItem , requestApi } from "@/services/authService";
import { ToastContainer, toast } from "react-toastify";

export type AgentSectionRef = { createAgent: () => Promise<void>};

const AgentSection = forwardRef<AgentSectionRef, {
  CIndex: number;
  selectedAgentType: string;
  onAgentTypeChange: (type: string) => void;
}>(({ CIndex, selectedAgentType, onAgentTypeChange }, ref) => {

   const userInfo = getLocalStorageItem("user_info") || {};
  const tenantId =  userInfo?.default_tenant_id || localStorage.getItem("tenant_id") || "";


 
  const inputRef = useRef<HTMLInputElement>(null);
  const inputMessageRef = useRef<HTMLTextAreaElement>(null);

    const AgentType=[
        {TapName:"Chat Agent",
        icon: ChatIcon,
        icon2: ChatIconBlack,
      },
      {TapName:"Voice Agent",
        icon: VoiceAgentIcon,
        icon2: VoiceAgentIconBlack,
      },
        {
          TapName:"Mail Agent",
          icon: MailIcon,
          icon2: MailIconBlack,
        }
    ]

   const handleCreateAgent = async () => {
  try {
    let payload = {};
    let url = "";

    if (selectedAgentType === "Chat Agent") {
      payload = {
        name: inputRef.current?.value,
        intial_message: inputMessageRef.current?.value,
        agent_type: "kb_agent",
      };

      url = `${tenantId}/widget/`;

    } else if (selectedAgentType === "Voice Agent") {
      payload = {
        agent_name: inputRef.current?.value,
        agent_type: "kb_agent",
      };

      url = `${tenantId}/voice/agent/config/`;
    }

    const response = await requestApi(
      "POST",
      url,
      payload,
      "authService"
    );
     toast.success(response?.message || response?.data?.message || "Agent Created Successfully");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    if (inputMessageRef.current) {
      inputMessageRef.current.value = "";
    }

  } catch (error: unknown) {
    console.error("Error creating agent:", error);
    toast.error(
      error instanceof Error
        ? error.message
        : "Failed to Creating Agent"
    );
  }
};

  useImperativeHandle(ref, () => ({ createAgent: handleCreateAgent }), [selectedAgentType, tenantId]);

  return (
    <>
    <div className="p-2 sm:p-6 h-full lg:h-[calc(86vh-210px)] overflow-y-scroll scrollbar-thin bg-gray-50 rounded-xl shadow-md border-2 border-gray-200">
      
      <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
        <span className="h-7 w-7 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white text-sm font-medium flex-shrink-0">
          {CIndex}
        </span>
        Create Your First Agent
      </h2>


      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-blue-50 border border-blue-200 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6">
        <div className="h-8 w-8 flex items-center justify-center rounded-full bg-blue-500 text-white min-w-fit flex-shrink-0">
          <img src={CreateAgentIcon} alt="create agent" className="h-4 w-4" />
        </div>
        <div className="min-w-0">
            <p className="text-xs sm:text-[14px] text-gray-500">Create a personalized AI agent to assist you with specific tasks. Choose the type that best fits your needs.</p>
        </div>
      </div>

      <div className="flex flex-col sm:justify-center md:justify-start sm:w-[100%] md:w-[70%] sm:flex-row flex-wrap gap-2 sm:gap-2 rounded-lg">
        {AgentType.map((agentType, index)=>(
            <div key={index} className="sm:flex-1 sm:min-w-0 rounded-lg" onClick={()=>onAgentTypeChange(agentType.TapName)}>
              <div className={`flex justify-between items-center gap-1 p-3 sm:p-2 text-black border-2 border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer ${selectedAgentType === agentType.TapName ? ' bg-gradient-to-r from-blue-600 to-blue-400 border text-white' : ''}`}>
               <img src={selectedAgentType === agentType.TapName ? agentType.icon : agentType.icon2} alt={agentType.TapName} className="h-5 w-5 flex-shrink-0 object-contain" />
                <span className="text-xs sm:text-sm font-light truncate">{agentType.TapName}</span>
              </div>
            </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-4 sm:gap-3 items-stretch md:items-center bg-green-50 border border-green-200 p-3 sm:p-4 rounded-lg mt-4 sm:mt-6 w-full">
        <div  className="flex flex-col items-center gap-1 w-full md:w-[40%] text-center md:text-left">
          <div className="h-14 w-14 sm:h-16 sm:w-16 flex items-center justify-center rounded-md bg-blue-300 text-white flex-shrink-0">
            <img src={AgentType.find(agent => agent.TapName === selectedAgentType)?.icon || ""} alt={selectedAgentType} className="h-8 w-8 sm:h-10 sm:w-10 object-contain" />
          </div>
            <h5 className="text-sm font-medium text-black">{selectedAgentType}</h5>
            {selectedAgentType === "Chat Agent" && <p className="text-xs sm:text-[14px] text-gray-500">Personalized AI assistants that can help with specific tasks through chat.</p>}
            {selectedAgentType === "Voice Agent" && <p className="text-xs sm:text-[14px] text-gray-500">Talk to your AI assistant with natural voice conversations.</p>}
            {selectedAgentType === "Mail Agent" && <p className="text-xs sm:text-[14px] text-gray-500">AI assistants that handle your email communications automatically.</p>}
        </div>
        <div className="w-full md:w-[60%] flex flex-col gap-2 min-w-0">
      {selectedAgentType === "Chat Agent" && (
        <div className="w-full">

          <div>
            <label htmlFor="agentName" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Agent Name</label>
          <input type="text" placeholder="Agent Name" className="border border-gray-300 outline-none rounded-md p-2 w-full mb-2 text-sm sm:text-base" ref={inputRef} />
          </div>
        <div className="mt-2">
        <label htmlFor="agentDescription" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Welcome Message</label>
      <textarea placeholder="Agent Description" className="border outline-none border-gray-300 rounded-md p-2 w-full text-sm sm:text-base min-h-[80px]" ref={inputMessageRef} />
        </div>
      </div>)}

      {selectedAgentType === "Voice Agent" && (
        <div className="mt-2 w-full">
          <label htmlFor="voiceAgentName" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Voice Agent Name</label>
          <input type="text" placeholder="Voice Agent Name" className="border outline-none border-gray-300 rounded-md p-2 w-full mb-2 text-sm sm:text-base" ref={inputRef} />
        </div>
      )}

      {selectedAgentType === "Mail Agent" && (<div className="mt-2 flex flex-col sm:flex-row gap-3 sm:gap-2 items-center justify-between border border-yellow-300 bg-yellow-50 p-3 rounded-md">
        <div className="flex items-center justify-center flex-shrink-0">
          <span className="flex items-center h-10 w-10 pl-1 bg-yellow-300 rounded-full text-white">
          <img src={StarIcon} alt="Premium Feature" className="h-8 w-8 object-contain" />
          </span>
        </div>
        <div className="flex flex-col items-start gap-1 min-w-0 text-center sm:text-left">
          <span className="text-sm font-medium text-gray-500">Premium Feature</span>
          <p className="text-gray-600 text-xs sm:text-sm mb-0">Email agents are available in the AGENTS  EMAIL AGENTS section of your dashboard. You can create and manage your email agents there.</p>
        </div>
      </div>)}
        </div>
      </div>
      </div>
       <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        className="mr-20"
      />
    </>
  );
});

AgentSection.displayName = 'AgentSection';

export default AgentSection;