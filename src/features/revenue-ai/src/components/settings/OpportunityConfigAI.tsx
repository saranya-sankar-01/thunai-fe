
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Bot, Target, TrendingUp, Settings, Lightbulb, Pencil } from 'lucide-react';
import { useOpportunityConfigStore } from '../../store/opportunityConfigStore';
import { Input } from '../ui/input';
import { CustomFieldsConfig } from './CustomFieldsConfig';

export const OpportunityConfigAI = () => {
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({});
  const [inputValue, setInputValue] = useState("")
  const { opportunityConfig, loadOpportunityConfig, loading, chatMessages, getChatHistory, sendMessage, deleteChatHistory } = useOpportunityConfigStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const messageEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    loadOpportunityConfig();
    getChatHistory();
  }, [loadOpportunityConfig, getChatHistory])

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSendMessage = async () => {
    await sendMessage(inputValue);
    setInputValue("");
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }

  const handleDeleteChatHistory = async () => {
    await deleteChatHistory();
  }

  const handleQuickPrompt = (text: string) => {
    setInputValue(text);
    inputRef.current?.focus();
  }

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, loading.sendingMessage])

  if (loading.configLoading) {
    return (<div className="flex justify-center items-center h-full">
      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
      Loading...
    </div>)
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      <div className="p-6 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center space-x-3 mb-2">
          <Bot className="text-blue-600" size={24} />
          <h1 className="text-2xl font-bold text-gray-900">Opportunity AI Configuration</h1>
        </div>
        <p className="text-gray-600">Configure how AI identifies and categorizes opportunities from your interactions.</p>
      </div>

      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="p-6 space-y-6">
            <CustomFieldsConfig />
            {/* Opportunity Definition */}
            <Collapsible>
              <CollapsibleTrigger
                className="flex items-center justify-between w-full p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                onClick={() => toggleSection('definition')}
              >
                <div className="flex items-center space-x-3">
                  <Target className="text-blue-600" size={20} />
                  <h2 className="text-lg font-semibold text-gray-900">Opportunity Definition</h2>
                </div>
                {expandedSections['definition'] ? (
                  <ChevronDown className="text-gray-500" size={20} />
                ) : (
                  <ChevronRight className="text-gray-500" size={20} />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className='flex justify-between mb-2'>
                  <p className="text-lg font-semibold text-gray-700">
                    Definition Configuration
                  </p>
                  {opportunityConfig.definition &&
                    <Button variant='outline' onClick={() => handleQuickPrompt("Edit the opportunity definition")}><span><Pencil size={16} /></span> Edit</Button>
                  }
                </div>
                <div className="bg-white border border-gray-200 rounded p-3">
                  <p className="text-sm text-gray-800">{opportunityConfig.definition}</p>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Maturity Indicators */}
            <Collapsible>
              <CollapsibleTrigger
                className="flex items-center justify-between w-full p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                onClick={() => toggleSection('indicators')}
              >
                <div className="flex items-center space-x-3">
                  <TrendingUp className="text-green-600" size={20} />
                  <h2 className="text-lg font-semibold text-gray-900">Maturity Indicators</h2>
                </div>
                {expandedSections['indicators'] ? (
                  <ChevronDown className="text-gray-500" size={20} />
                ) : (
                  <ChevronRight className="text-gray-500" size={20} />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className='flex justify-between mb-2'>
                  <p className="text-lg font-semibold text-gray-700">
                    Indicators Configuration
                  </p>
                  {opportunityConfig.indicators?.length > 0 &&
                    <Button variant='outline' onClick={() => handleQuickPrompt("Modify the maturity indicators")}><span><Pencil size={16} /></span> Edit</Button>
                  }
                </div>
                <div className="space-y-2">
                  {opportunityConfig?.indicators?.map((indicator, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded p-2 text-sm text-gray-800">
                      • {indicator.name}
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Opportunity Stages */}
            <Collapsible>
              <CollapsibleTrigger
                className="flex items-center justify-between w-full p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                onClick={() => toggleSection('stages')}
              >
                <div className="flex items-center space-x-3">
                  <Settings className="text-purple-600" size={20} />
                  <h2 className="text-lg font-semibold text-gray-900">Opportunity Stages</h2>
                </div>
                {expandedSections['stages'] ? (
                  <ChevronDown className="text-gray-500" size={20} />
                ) : (
                  <ChevronRight className="text-gray-500" size={20} />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className='flex justify-between mb-2'>
                  <p className="text-lg font-semibold text-gray-700">
                    Stage Configuration
                  </p>
                  {opportunityConfig.stages?.length > 0 &&
                    <Button variant='outline' onClick={() => handleQuickPrompt("Update the opportunity stages")}><span><Pencil size={16} /></span> Edit</Button>
                  }
                </div>
                <div className="space-y-3">
                  {opportunityConfig?.stages?.map((stage, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded p-3">
                      <h3 className="font-medium text-gray-900 mb-1">{stage.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{stage.description}</p>
                      {/* <div className="space-y-1">
                        {stage.criteria.map((criterion, idx) => (
                          <div key={idx} className="text-xs text-gray-500">
                            • {criterion}
                          </div>
                        ))}
                      </div> */}
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible>
              <CollapsibleTrigger
                className="flex items-center justify-between w-full p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
                onClick={() => toggleSection('confidence')}
              >
                <div className="flex items-center space-x-3">
                  <Lightbulb className="text-yellow-600" size={20} />
                  <h2 className="text-lg font-semibold text-gray-900">Confidence</h2>
                </div>
                {expandedSections['confidence'] ? (
                  <ChevronDown className="text-gray-500" size={20} />
                ) : (
                  <ChevronRight className="text-gray-500" size={20} />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className='flex justify-between mb-2'>
                  <p className="text-lg font-semibold text-gray-700">
                    Confidence Configuration
                  </p>
                  {opportunityConfig.confidence?.length > 0 &&
                    <Button variant='outline' onClick={() => handleQuickPrompt("Change the confidence based on stages")}><span><Pencil size={16} /></span> Edit</Button>
                  }
                </div>
                <div className="space-y-3">
                  {opportunityConfig?.confidence?.map((stage, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded p-3">
                      <h3 className="font-medium text-gray-900 mb-1">{stage.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{stage.percentage}</p>
                      {/* <div className="space-y-1">
                        {stage.criteria.map((criterion, idx) => (
                          <div key={idx} className="text-xs text-gray-500">
                            • {criterion}
                          </div>
                        ))}
                      </div> */}
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>

            <div className='flex flex-col'>
              <div className='flex justify-end mb-2'>
                <Button variant='outline' onClick={handleDeleteChatHistory}>Clear</Button>
              </div>
              <div className="max-w-4xl px-4 mb-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-900">
                <div className="p-2 text-sm">
                  Hi! I'm your AI assistant for configuring opportunity Agent. I can help you customize:
                  🎯 <strong>What defines an opportunity</strong> – How you identify potential deals<br />
                  📊 <strong>Maturity indicators</strong> – Signs that show how developed an opportunity is<br />
                  📈 <strong>Opportunity stages</strong> – The progression from discovery to close<br />
                  🎚️ <strong>Confidence thresholds</strong> – How you measure deal probability<br />

                  <strong>Current setup:</strong><br />
                  • <strong>Definition</strong>: {opportunityConfig.definition}<br />
                  • <strong>Maturity Indicators</strong>: {opportunityConfig.indicators?.length} configured<br />
                  • <strong>Stages</strong>: {opportunityConfig.stages?.length} stages defined<br />
                  • <strong>Confidence Levels</strong>:
                  {opportunityConfig.confidence?.map((stage) => stage.name).join(', ')},<br /><br />
                  What would you like to configure or change?
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                {chatMessages.map((message, index) => (
                  <div key={index}>
                    {/* User Message */}
                    {message.user && (
                      <div className="text-right">
                        <div className="bg-blue-500 text-left text-white my-2 ml-auto inline-block text-sm px-4 py-2 rounded-lg max-w-[50%] break-words">
                          {message.user}
                        </div>
                      </div>
                    )}

                    {/* Model Response */}
                    {message.model && (
                      <div className="text-left">
                        <div className="bg-gray-50 text-gray-900 my-2 inline-block text-sm px-4 py-2 rounded-lg max-w-[60%] break-words">
                          {message.model.refined_string_response}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {loading.sendingMessage && (
                <div className="flex items-start space-x-2 border border-gray-200 rounded-lg p-2 w-fit">
                  <div className='h-3 w-3 bg-black rounded-full animate-bounce [animation-delay:-0.3s]'></div>
                  <div className='h-3 w-3 bg-black rounded-full animate-bounce [animation-delay:-0.15s]'></div>
                  <div className='h-3 w-3 bg-black rounded-full animate-bounce'></div>
                </div>
              )}
            </div >
            <div ref={messageEndRef} />
            {/* AI Training Actions */}
            {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">AI Training</h2>
              <p className="text-sm text-gray-600 mb-4">
                Train the AI model with your specific configuration and historical data.
              </p>
              <div className="flex space-x-3">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Bot size={16} className="mr-2" />
                  Retrain AI Model
                </Button>
                <Button variant="outline">
                  Test Configuration
                </Button>
              </div>
            </div> */}
          </div >
        </ScrollArea >
      </div >
      <div className='sticky bottom-2 bg-white p-2'>
        <div className="sm:hidden">
          <input type="checkbox" id="togglePrompts" className="hidden peer" />
          <label htmlFor="togglePrompts"
            className="flex justify-between items-center cursor-pointer text-xs md:text-sm text-textTertiary mb-2">
            <span className="font-medium">Quick configuration prompts</span>
            <img src="assets/images/revenue_AI/toggle.svg" alt="toggle"
              className="w-4 h-4 transition-transform duration-300 peer-checked:rotate-180" />
          </label>


          <div className="grid grid-cols-1 gap-2 mb-4 peer-checked:grid hidden">
            <button onClick={() => handleQuickPrompt("Update the opportunity definition for our SaaS business")}
              className="text-xs md:text-sm bg-white hover:bg-gray-50 text-gray-700 px-3 py-2 rounded border border-gray-200 transition-colors text-left">
              "Update the opportunity definition for our SaaS business"
            </button>
            <button onClick={() => handleQuickPrompt("Add industry-specific maturity indicators")}
              className="text-xs md:text-sm bg-white hover:bg-gray-50 text-gray-700 px-3 py-2 rounded border border-gray-200 transition-colors text-left">
              "Add industry-specific maturity indicators"
            </button>
            <button onClick={() => handleQuickPrompt("Customize stages for enterprise sales")}
              className="text-xs md:text-sm bg-white hover:bg-gray-50 text-gray-700 px-3 py-2 rounded border border-gray-200 transition-colors text-left">
              "Customize stages for enterprise sales"
            </button>
            <button onClick={() => handleQuickPrompt("Set confidence thresholds based on deal size")}
              className="text-xs md:text-sm bg-white hover:bg-gray-50 text-gray-700 px-3 py-2 rounded border border-gray-200 transition-colors text-left">
              "Set confidence thresholds based on deal size"
            </button>
          </div>
        </div>


        <div className="hidden sm:grid grid-cols-2 gap-2 mb-4">
          <button onClick={() => handleQuickPrompt("Update the opportunity definition for our SaaS business")}
            className="text-xs md:text-sm bg-white hover:bg-gray-50 text-gray-700 px-3 py-2 rounded border border-gray-200 transition-colors text-left">
            "Update the opportunity definition for our SaaS business"
          </button>
          <button onClick={() => handleQuickPrompt("Add industry-specific maturity indicators")}
            className="text-xs md:text-sm bg-white hover:bg-gray-50 text-gray-700 px-3 py-2 rounded border border-gray-200 transition-colors text-left" >
            "Add industry-specific maturity indicators"
          </button >
          <button onClick={() => handleQuickPrompt("Customize stages for enterprise sales")}
            className="text-xs md:text-sm bg-white hover:bg-gray-50 text-gray-700 px-3 py-2 rounded border border-gray-200 transition-colors text-left" >
            "Customize stages for enterprise sales"
          </button >
          <button onClick={() => handleQuickPrompt("Set confidence thresholds based on deal size")}
            className="text-xs md:text-sm bg-white hover:bg-gray-50 text-gray-700 px-3 py-2 rounded border border-gray-200 transition-colors text-left" >
            "Set confidence thresholds based on deal size"
          </button >
        </div >

        <div className="flex space-x-2">
          <Input ref={inputRef} type="text" value={inputValue} onKeyDown={handleKeyDown} onChange={(e) => setInputValue(e.target.value)}
            placeholder="Tell me how you want to configure opportunities..."
          />
          <Button
            onClick={handleSendMessage}
            disabled={loading.sendingMessage}
            className="inline-flex cursor-pointer items-center justify-center disabled:cursor-not-allowed disabled:bg-gray-400 gap-2 whitespace-nowrap bg-black text-sm font-medium h-9 rounded-md px-3"
          >
            <img src="/send-icon.svg" alt="send-icon" />
          </Button>
        </div >
      </div>
    </div >
  );
};
