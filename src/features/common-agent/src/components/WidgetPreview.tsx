// WidgetPreview.tsx
import { MessageCircle, Maximize2, Phone, Send } from "lucide-react";
import { AgentData } from "../types/agent";


interface WidgetPreviewProps {
  config: AgentData;
  previewMode: "desktop" | "mobile";
}

export function WidgetPreview({ config, previewMode }: WidgetPreviewProps) {
  return (
    <div className="space-y-4">
      {/* Widget Preview Label */}
      <div>
        <h3 className="font-medium text-sm text-gray-900 mb-1">Widget Preview</h3>
        <p className="text-xs text-gray-500">This is how your widget will appear to users.</p>
      </div>
      
      {/* Main Widget Container */}
      <div 
        className={`relative ${previewMode === 'mobile' ?  'w-90 h-[530px]' : 'w-90 h-[525px]'} bg-white rounded-lg shadow-lg border overflow-hidden `}
        style={{ backgroundColor: config.widget?.widget_bg_color || '#FFFFFF',   borderRadius: `${config.widget?.border_radius || 8}px`}}
      >
        {/* Header */}
        <div 
          className="px-4 py-3 flex items-center justify-between border-b"
          style={{ backgroundColor: config.widget?.primary_color || '#3B82F6' }}
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
             {config.widget?.logo ? (
        <img 
          src={config.widget.logo} 
          alt="Widget Logo"
          className="w-5 h-5 object-contain"
        />
      ) : (
        <div className="w-3 h-3 bg-white rounded-full"></div>
      )}
            </div>
             {config.interfaces?.chatbox?.trademark && (
      <img 
        src="/svg/thunai_trademark.svg" 
        alt="Thunai Trademark"
        className="w-14 h-6 object-contain"
      />
    )}
          </div>
          <div className="flex items-center gap-2">
            <button className="text-white hover:bg-white hover:bg-opacity-10 p-1 rounded">
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
        </svg>
            </button>
             <button className="text-white hover:bg-white hover:bg-opacity-10 p-1 rounded">
                       <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<mask id="mask0_5521_7574"  maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
<rect width="24" height="24" fill="#ffffff"/>
</mask>
<g mask="url(#mask0_5521_7574)">
<path d="M7 17H10C10.2833 17 10.5208 17.0958 10.7125 17.2875C10.9042 17.4792 11 17.7167 11 18C11 18.2833 10.9042 18.5208 10.7125 18.7125C10.5208 18.9042 10.2833 19 10 19H6C5.71667 19 5.47917 18.9042 5.2875 18.7125C5.09583 18.5208 5 18.2833 5 18V14C5 13.7167 5.09583 13.4792 5.2875 13.2875C5.47917 13.0958 5.71667 13 6 13C6.28333 13 6.52083 13.0958 6.7125 13.2875C6.90417 13.4792 7 13.7167 7 14V17ZM17 7H14C13.7167 7 13.4792 6.90417 13.2875 6.7125C13.0958 6.52083 13 6.28333 13 6C13 5.71667 13.0958 5.47917 13.2875 5.2875C13.4792 5.09583 13.7167 5 14 5H18C18.2833 5 18.5208 5.09583 18.7125 5.2875C18.9042 5.47917 19 5.71667 19 6V10C19 10.2833 18.9042 10.5208 18.7125 10.7125C18.5208 10.9042 18.2833 11 18 11C17.7167 11 17.4792 10.9042 17.2875 10.7125C17.0958 10.5208 17 10.2833 17 10V7Z" fill="#ffffff"/>
</g>
</svg>
            </button>
            <button className="text-white hover:bg-white hover:bg-opacity-10 p-1 rounded">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Chat Messages Area */}
       <div className="p-4 flex flex-col min-h-[380px] max-h-[450px]">
  {/* Messages Section */}
  <div className="space-y-3 overflow-y-auto flex-1">
    {/* Bot Message */}
    <div className="flex items-start gap-2">
      <div
        className="max-w-xs rounded-lg px-3 py-2 text-sm"
        style={{
          backgroundColor: config.widget?.secondary_color || "#DEDEDE",
          color: config.widget?.bot_text || "#000000",
        }}
      >
        {config.widget?.intial_message ||
          "Thunai is an AI-powered tool designed to enhance business operations by connecting a centralized Deep Mind to AI for delivering personalized insights."}
      </div>
    </div>

    {/* User Message Example */}
    <div className="flex justify-end">
      <div
        className="max-w-xs rounded-lg px-3 py-2 text-sm"
        style={{
          backgroundColor: config.widget?.tertiary_color || "#1E293B",
          color: config.widget?.user_text || "#FFFFFF",
        }}
      >
        What is Thunai AI?
      </div>
    </div>
  </div>

  {/* FAQ Section fixed at bottom */}
  {config.interfaces?.chatbox?.faqs &&
    config.interfaces.chatbox.faqs.length > 0 && (
      <div className="space-y-2 max-h-[100px] overflow-y-auto">
        {config.interfaces.chatbox.faqs.map((faq, index) => (
          <button
            key={index}
            className="grid grid-rows-1 p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors w-full text-left"
            style={{
              borderColor: config.widget?.primary_color || "#3B82F620",
              color: config.widget?.primary_color || "#3B82F6",
            }}
          >
            <span className="text-[11px]">{faq.question}</span>
          </button>
        ))}
      </div>
    )}
</div>


        {/* Input Area */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex gap-2 items-center">
            <div className="flex-1 relative">
               <button className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
                </svg>
              </button>
              <input
                type="text"
                placeholder={config.widget?.placeholder || 'Message Thunai...'}
                className="w-full pl-10 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 pr-10"
                style={{ '--tw-ring-color': config.widget?.primary_color || '#3B82F6' } as any}
                disabled
              />
            </div>
          
            {/* Send button */}
            <button 
              className="p-2 rounded-lg text-white transition-colors"
              style={{ backgroundColor: config.widget?.primary_color || '#3B82F6' }}
              title="Send Message"
            >
              <Send className="h-4 w-4" />
            </button>
             {/* Conditionally show voice button if voice interface is enabled */}
            {config.interfaces?.voice?.enabled && (
              <button 
                className="p-2 rounded-lg text-white transition-colors"
                style={{ backgroundColor: config.widget?.primary_color || '#3B82F6' }}
                title="Voice Call"
              >
                 <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="white"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M7.167 15.416V4.583a.75.75 0 0 1 1.5 0v10.833a.75.75 0 0 1-1.5 0Zm4.166-2.5V7.083a.75.75 0 0 1 1.5 0v5.833a.75.75 0 0 1-1.5 0ZM3 11.25V8.75a.75.75 0 0 1 1.5 0v2.5a.75.75 0 0 1-1.5 0Zm12.5 0V8.75a.75.75 0 0 1 1.5 0v2.5a.75.75 0 0 1-1.5 0Z"></path>
                        </svg>
              </button>
            )}
          </div>
        <p className="text-[10px] text-center text-gray-400 p-1 ">
Thunai may generate responses that are incomplete, outdated, or inaccurate. <br />
  Please verify critical information independently before making decisions.</p>
        </div>
      </div>

      {/* Widget Icon Preview */}
      {config.widget?.show_beacon && (
      <div>
        <h4 className="font-medium text-sm text-gray-900 mb-2">Widget Icon Preview</h4>
        <div className="flex justify-center">
          {/* Show text + icon when display_type is "all" and widget_text exists */}
          {config.widget?.display_type === "all" && config.widget?.widget_text ? (
            <div className="flex items-center gap-3 bg-white rounded-full shadow-lg px-4 py-2 border hover:shadow-xl transition-shadow cursor-pointer">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: config.widget?.primary_color || '#3B82F6' }}
              >
                {config.widget?.selectedIconUrl ? (
                  <img 
                    src={config.widget.selectedIconUrl} 
                    alt="Widget Icon"
                    className="w-6 h-6 object-contain"
                  />
                ) : (
                  <></>
                )}
              </div>
              <span className="text-gray-800 font-medium text-sm whitespace-nowrap">
                {config.widget.widget_text}
              </span>
            </div>
          ) : (
            <div 
              className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
              style={{ backgroundColor: config.widget?.primary_color || '#3B82F6' }}
            >
              {config.widget?.selectedIconUrl ? (
                <img 
                  src={config.widget.selectedIconUrl} 
                  alt="Widget Icon"
                  className="w-6 h-6"
                />
              ) : (
                <></>
              )}
            </div>
          )}
        </div>
      </div>)}
    </div>
  );
}
