import { useEffect, useState, useRef } from "react";
import { Check } from "lucide-react";
import { GrIntegration } from "react-icons/gr";
import { LuBrainCog } from "react-icons/lu";
// import AppSetUpIcon from "@/assets/svg/AppSetup.svg";
import { MdOutlineAppSettingsAlt, MdOutlineSupportAgent } from "react-icons/md";
import LeftArrow from "../assets/svg/Arrow_back.svg";
import IntegrationSection from "../Subcomponent/IntegrationSection";
import BrainSection from "../Subcomponent/BrainSection";
import ConnectApplication from "../Subcomponent/ConnectApplication";
import QuickStartSidebar from "../Subcomponent/QuickStartSidebar";
import  ApplicationData from "../Store/ApplicationData";
import AgentSection, { type AgentSectionRef } from "../Subcomponent/AgentSection";
import  FinalSection from "../Subcomponent/FinalSection";

import { requestApi } from "../Service/MeetingService";

const steps = [
  { id:1,
    label: "Integrations",
    icon: <GrIntegration size={18} />,
  },
  {  id:2,
    label: "Brain",
    icon: <LuBrainCog size={18} />,
  },
  {  id:3,
    label: "App Setup",
    icon: <MdOutlineAppSettingsAlt size={18} />,
  },
  {  id:4,
    label: "Agents",
    icon: <MdOutlineSupportAgent size={18} />,
  },
  {  id:5,
    label: "Complete",
    icon: <Check size={18} />,
  },
];

const OverView = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [switchNext, setSwitchNext] = useState(false);
  const [selectedAgentType, setSelectedAgentType] = useState<string>("Chat Agent");
  const agentSectionRef = useRef<AgentSectionRef>(null);

  const {ApplicationList,fetchApplications,isLoading,SelectedApps} = ApplicationData();
  
  useEffect(()=>{
      fetchApplications();
  },[])

  useEffect(()=>{
    const FetchCurrentCount = async() => {
      try{
        const res = await requestApi(
          "GET",
          `getting-started/fields/`,
          {},
          "accountService"
        )
        const stepNumber = res.data.completed_status || 1;
        setActiveStep(stepNumber);
      }catch(err: unknown){
        console.error("Error fetching current count:", err);
      }
    }
    FetchCurrentCount();
  },[])
  

  const handleNextClick = async () => {
    if (activeStep < steps.length) {
      const nextStep = activeStep + 1;
      setSwitchNext(true)
      try {
        await requestApi(
          "POST",
          `getting-started/fields/`,
          { completed_status: nextStep },
          "accountService"
        );
        setSwitchNext(false)
        setActiveStep(nextStep);
      } catch (err: unknown) {
        console.error("Error updating step:", err);
        setSwitchNext(false)
      }
    }
  };

  const handleStepClick = (index: number) => {
    setActiveStep(index + 1);
  };

 const featureSets: { CHAT_AGENT: string[]; VOICE_AGENT: string[]; EMAIL_AGENT: string[] } = {
    CHAT_AGENT: [
      'Customizable Widget Appearance: You can customize the appearance and behavior of the chat widget through basic settings like widget name and allowed domains, ensuring it aligns with your brand and operational needs.',
      'Agent Language Selection: Choose the language in which the agent will communicate, ensuring effective communication with your target audience.',
      'Workflow Automation: Automate repetitive tasks and workflows to improve efficiency.',
      'Seamless Communication: Facilitate automated responses via text, ensuring consistent communication across channels.',
      'Integration Capabilities: Seamlessly integrate with other applications to automate workflows and enhance productivity.'
    ],
    VOICE_AGENT: [
      'Customizable Widget Appearance: You can customize the appearance and behavior of the chat widget through basic settings like widget name and allowed domains, ensuring it aligns with your brand and operational needs.',
      'Agent Language Selection: Choose the language in which the agent will communicate, ensuring effective communication with your target audience.',
      'Multi-Language Support: Supports multiple languages in a single voice bot and handle any language on the go.',
      'Screen-Share Support: Ability to understand and view the screen and troubleshoot problems effectively.',
      'Workflow Automation: Automate repetitive tasks and workflows to improve efficiency.',
      'Seamless Communication: Facilitate automated responses via voice, ensuring consistent communication across channels.',
      'Integration Capabilities: Seamlessly integrate with other applications to automate workflows and enhance productivity.'
    ],
    EMAIL_AGENT: [
      'Thunai Email Agents are intelligent automation tools that handle email communications for support and sales workflows.',
      'They provide automated responses to common queries, reducing manual effort and improving response times.',
      'The agents integrate with platforms like Gmail, Outlook, Slack, and CRM systems to trigger actions based on email content.',
      'Setup involves creating an agent, defining its persona and behavior, setting an email prefix, and configuring workflow integrations.',
      'Support agents automatically create tickets from user emails and respond with ticket details.',
      'Sales agents handle product inquiries by offering meeting slots, scheduling appointments, handling first level questions and managing calendar invites.',
      'The system includes smart actionable insights from email content analysis.',
      'Both agent types feature inbox sections for monitoring communications and system logs.',
      'Email agents can create new CRM contacts or update existing records based on interactions.',
      'Overall, they streamline operations, ensure consistent communication, and enhance user engagement across support and sales channels.'
    ]
  };

  return (
    <div className="flex flex-col lg:flex-row sm:min-h-0 h-full lg:h-[100vh] p-4">
    
      <div className={`flex-1 min-w-0 ${activeStep === 3 && SelectedApps.length > 0 ? "" : ""} transition-all`}>
        <div className={` ${activeStep === 3 || activeStep === 4 ? "sm:px-[10px] lg:px-[50px]":"sm:h-[10px] lg:px-[170px]"}`}>

        <div className="flex flex-col items-center text-center gap-2 mb-2">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold">
            Get Started With{" "}
            <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent font-bold">
              Thunai!
            </span>
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm md:text-base max-w-md lg:max-w-lg xl:max-w-xl">
            Complete these steps to set up your Thunai experience.
          </p>
        </div>

        <div className="hidden sm:flex items-center justify-between sm:mt-5 mt-2 relative gap-2 md:gap-4 lg:gap-2 xl:gap-4">
          {steps.map((step, index) => {
            const isCompleted = index + 1 < activeStep;
            const isActive = index + 1 === activeStep;

            return (
              <div
                key={index}
                className="flex flex-col items-center flex-1 relative min-w-0"
              >
                {index !== steps.length - 1 && (
                  <div className="absolute top-6 z-50 left-1/2 w-full h-[2px] bg-gray-300 -z-10">
                    <div
                      className={`h-[2px] ${
                        index < activeStep
                          ? "bg-gradient-to-r from-blue-500 to-purple-600 w-full"
                          : "w-0"
                      }`}
                    ></div>
                  </div>
                )}


                <div
                  className={`sm:w-12 sm:h-12 w-15 h-15 rounded-full z-[99] flex items-center justify-center font-semibold transition-all duration-300 flex-shrink-0 cursor-pointer ${
                    isActive
                      ? "bg-blue-500 text-white ring-4 ring-blue-200"
                      : isCompleted
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                  onClick={() => handleStepClick(index)}
                >
                  {isCompleted ? <Check size={18} className="sm:w-5 sm:h-5" /> : step.icon}
                </div>

                <p
                  className="mt-1 sm:mt-2 text-[10px] sm:text-sm md:text-base text-gray-700 cursor-text hover:text-blue-500 truncate w-full text-center"
                >
                  {step?.label}
                </p>
              </div>
            );
          })}
        </div>

      <div className="sm:hidden w-full p-2">
        <div className="text-center mb-4">
          <p className="text-xs sm:text-sm text-gray-500">Step {activeStep} of {steps.length}: {steps[activeStep - 1]?.label}</p>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(activeStep / steps.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="mt-2">
      {activeStep > 1 && (
        <button className="flex items-center cursor-pointer gap-1 text-blue-700 text-sm sm:text-base hover:opacity-80 mb-2" onClick={()=>{
          if (activeStep > 1){
            setActiveStep(activeStep - 1)
          }
        }}><img src={LeftArrow} alt="" className="w-4 h-4" />Back</button>
      )}
      </div>
      <section className="h-full lg:h-[calc(60vh-100px)]">
        {activeStep === 1 && (
           <IntegrationSection CIndex={activeStep} />
          )}
        {activeStep === 2 && (
           <BrainSection CIndex={activeStep} />
          )}
        {activeStep === 3 && (
          <ConnectApplication CIndex={activeStep} ApplicationList={ApplicationList} isLoading={isLoading} />
        )}
        {activeStep === 4 && (
          <AgentSection
            ref={agentSectionRef}
            CIndex={activeStep}
            selectedAgentType={selectedAgentType}
            onAgentTypeChange={setSelectedAgentType}
          />
        )}

        {activeStep === 5 && (
           <FinalSection />
          )}

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-2 sm:mt-4  mt-2">
            {activeStep === 4 && (
              <button
                type="button"
                onClick={() => agentSectionRef.current?.createAgent()}
                className="w-full sm:w-auto mt-2 sm:mt-0 px-4 sm:px-6 py-2.5 sm:py-2 text-sm sm:text-base bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors cursor-pointer"
              >
                Create Agent
              </button>
            )}
            
            {activeStep < steps.length && (
              <button
                onClick={handleNextClick}
                className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-2 text-sm sm:text-base bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors cursor-pointer"
              >
                {activeStep === 4 ? "Skip and Continue" : switchNext? "Loading..." : "Next"}
              </button>
            )}
          </div>
        
      </section>

        </div>
      </div>

      {(activeStep === 3 || activeStep === 4) && <QuickStartSidebar selectedApps={SelectedApps} 
      activeStep={activeStep} featureSets={featureSets} selectedAgentType={selectedAgentType}/>}
      
    </div>
  );
};

export default OverView;
